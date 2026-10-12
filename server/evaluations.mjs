import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const EVAL_FILE = path.join(DATA_DIR, 'evaluations.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const recordEvaluation = async (evaluation) => {
  const evals = await getEvaluations();
  evals.push({
    ...evaluation,
    timestamp: new Date().toISOString()
  });
  
  await fs.promises.writeFile(EVAL_FILE, JSON.stringify(evals, null, 2));
};

export const getEvaluations = async () => {
  try {
    if (!fs.existsSync(EVAL_FILE)) return [];
    const data = await fs.promises.readFile(EVAL_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};
