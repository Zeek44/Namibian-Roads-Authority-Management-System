import { neon } from '@neondatabase/serverless';

const NullishQueryFunction = () => {
  throw new Error(
    'No database connection string was provided to `neon()`. Please set process.env.DATABASE_URL to a valid Neon connection string'
  );
};
NullishQueryFunction.transaction = () => {
  throw new Error(
    'No database connection string was provided to `neon()`. Please set process.env.DATABASE_URL to a valid Neon connection string'
  );
};

function isValidNeonUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:';
  } catch {
    return false;
  }
}

const sql = process.env.DATABASE_URL && isValidNeonUrl(process.env.DATABASE_URL)
  ? neon(process.env.DATABASE_URL)
  : NullishQueryFunction;

export default sql;