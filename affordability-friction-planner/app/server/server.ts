import { analytics, createApp, lakebase } from '@databricks/appkit';

createApp({
  plugins: [
    ...(process.env.DATABRICKS_WAREHOUSE_ID ? [analytics()] : []),
    ...(process.env.LAKEBASE_ENDPOINT ? [lakebase()] : []),
  ],
}).catch(console.error);
