import * as schema from './db/schema';
import { mysqlGenerate } from 'drizzle-dbml-generator';

mysqlGenerate({
  schema,
  out: './schema.dbml',
  relational: false
});

