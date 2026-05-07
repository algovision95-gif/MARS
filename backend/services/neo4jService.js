/**
 * Neo4j Graph Service — Knowledge Graph Operations
 * Handles creation and querying of research knowledge graphs.
 */
import { getNeo4jSession } from '../config/db.js';

/**
 * Check if Neo4j is available
 */
export function isNeo4jAvailable() {
  return getNeo4jSession() !== null;
}

/**
 * Create a Research node in Neo4j
 */
export async function createResearchNode({ researchId, query, projectId, userId, title }) {
  const session = getNeo4jSession();
  if (!session) return null;

  try {
    const result = await session.run(
      `CREATE (r:Research {
        researchId: $researchId,
        query: $query,
        title: $title,
        projectId: $projectId,
        userId: $userId,
        createdAt: datetime()
      }) RETURN r`,
      { researchId, query, title: title || query, projectId: projectId || '', userId }
    );
    return result.records[0]?.get('r').properties;
  } catch (err) {
    console.error('Neo4j createResearchNode error:', err.message);
    return null;
  } finally {
    await session.close();
  }
}

/**
 * Create Paper nodes + link to Research
 */
export async function createPaperNodes(researchId, papers = []) {
  const session = getNeo4jSession();
  if (!session || papers.length === 0) return [];

  try {
    const created = [];
    for (const paper of papers) {
      const result = await session.run(
        `MERGE (p:Paper {title: $title})
         ON CREATE SET p.year = $year, p.method = $method, p.accuracy = $accuracy, p.authors = $authors
         WITH p
         MATCH (r:Research {researchId: $researchId})
         MERGE (r)-[:ANALYZED]->(p)
         RETURN p`,
        {
          title: paper.title || 'Untitled',
          year: paper.year || '',
          method: paper.method || '',
          accuracy: paper.accuracy || '',
          authors: paper.authors || '',
          researchId,
        }
      );
      if (result.records[0]) created.push(result.records[0].get('p').properties);
    }
    return created;
  } catch (err) {
    console.error('Neo4j createPaperNodes error:', err.message);
    return [];
  } finally {
    await session.close();
  }
}

/**
 * Create Topic nodes from extracted keywords
 */
export async function createTopicNodes(researchId, topics = []) {
  const session = getNeo4jSession();
  if (!session || topics.length === 0) return [];

  try {
    for (const topic of topics) {
      await session.run(
        `MERGE (t:Topic {name: $name})
         WITH t
         MATCH (r:Research {researchId: $researchId})
         MERGE (r)-[:COVERS]->(t)`,
        { name: topic, researchId }
      );
    }
    return topics;
  } catch (err) {
    console.error('Neo4j createTopicNodes error:', err.message);
    return [];
  } finally {
    await session.close();
  }
}

/**
 * Create relationships between papers
 */
export async function createPaperRelationship(paper1Title, paper2Title, relType = 'RELATED_TO', properties = {}) {
  const session = getNeo4jSession();
  if (!session) return null;

  try {
    await session.run(
      `MATCH (p1:Paper {title: $paper1})
       MATCH (p2:Paper {title: $paper2})
       MERGE (p1)-[r:${relType}]->(p2)
       SET r += $props`,
      { paper1: paper1Title, paper2: paper2Title, props: properties }
    );
  } catch (err) {
    console.error('Neo4j createRelationship error:', err.message);
  } finally {
    await session.close();
  }
}

/**
 * Get the knowledge graph for a project (nodes + edges)
 */
export async function getProjectGraph(projectId) {
  const session = getNeo4jSession();
  if (!session) return { nodes: [], edges: [] };

  try {
    const result = await session.run(
      `MATCH (r:Research {projectId: $projectId})-[rel]->(n)
       RETURN r, rel, n
       LIMIT 200`,
      { projectId }
    );

    const nodes = new Map();
    const edges = [];

    for (const record of result.records) {
      const research = record.get('r');
      const target = record.get('n');
      const relationship = record.get('rel');

      const rId = research.properties.researchId;
      const tId = target.properties.title || target.properties.name || target.identity.toString();

      if (!nodes.has(rId)) {
        nodes.set(rId, {
          id: rId,
          label: research.properties.title || research.properties.query,
          type: 'Research',
          color: '#ec4899',
        });
      }
      if (!nodes.has(tId)) {
        nodes.set(tId, {
          id: tId,
          label: tId,
          type: target.labels[0] || 'Node',
          color: target.labels[0] === 'Paper' ? '#3b82f6' : '#34d399',
        });
      }

      edges.push({
        source: rId,
        target: tId,
        type: relationship.type,
      });
    }

    return { nodes: Array.from(nodes.values()), edges };
  } catch (err) {
    console.error('Neo4j getProjectGraph error:', err.message);
    return { nodes: [], edges: [] };
  } finally {
    await session.close();
  }
}

/**
 * Get full graph for a single research query
 */
export async function getResearchGraph(researchId) {
  const session = getNeo4jSession();
  if (!session) return { nodes: [], edges: [] };

  try {
    const result = await session.run(
      `MATCH (r:Research {researchId: $researchId})-[rel]->(n)
       OPTIONAL MATCH (n)-[rel2]->(m)
       RETURN r, rel, n, rel2, m
       LIMIT 100`,
      { researchId }
    );

    const nodes = new Map();
    const edges = [];

    for (const record of result.records) {
      const r = record.get('r');
      const n = record.get('n');
      const rel = record.get('rel');
      const m = record.get('m');
      const rel2 = record.get('rel2');

      const rId = r.properties.researchId;
      const nId = n.properties.title || n.properties.name;

      if (!nodes.has(rId)) nodes.set(rId, { id: rId, label: r.properties.title, type: 'Research', color: '#ec4899' });
      if (nId && !nodes.has(nId)) nodes.set(nId, { id: nId, label: nId, type: n.labels[0], color: n.labels[0] === 'Paper' ? '#3b82f6' : '#34d399' });
      if (nId) edges.push({ source: rId, target: nId, type: rel.type });

      if (m && rel2) {
        const mId = m.properties.title || m.properties.name;
        if (mId && !nodes.has(mId)) nodes.set(mId, { id: mId, label: mId, type: m.labels[0], color: '#fbbf24' });
        if (mId && nId) edges.push({ source: nId, target: mId, type: rel2.type });
      }
    }

    return { nodes: Array.from(nodes.values()), edges };
  } catch (err) {
    console.error('Neo4j getResearchGraph error:', err.message);
    return { nodes: [], edges: [] };
  } finally {
    await session.close();
  }
}

/**
 * Store upload node linked to a project
 */
export async function createDatasetNode({ uploadId, filename, projectId, fileType }) {
  const session = getNeo4jSession();
  if (!session) return null;

  try {
    await session.run(
      `MERGE (d:Dataset {uploadId: $uploadId})
       ON CREATE SET d.filename = $filename, d.fileType = $fileType, d.createdAt = datetime()
       WITH d
       MERGE (p:Project {projectId: $projectId})
       MERGE (p)-[:HAS_DATASET]->(d)`,
      { uploadId, filename, projectId, fileType }
    );
  } catch (err) {
    console.error('Neo4j createDatasetNode error:', err.message);
  } finally {
    await session.close();
  }
}
