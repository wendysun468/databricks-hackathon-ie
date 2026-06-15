import { analytics, createApp, lakebase, server } from '@databricks/appkit';

await createApp({
  plugins: [
    server(),
    ...(process.env.DATABRICKS_WAREHOUSE_ID ? [analytics()] : []),
    ...(process.env.LAKEBASE_ENDPOINT ? [lakebase()] : []),
  ],
});
