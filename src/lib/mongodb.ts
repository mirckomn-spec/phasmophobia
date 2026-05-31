import { MongoClient, Db, type MongoClientOptions } from "mongodb";

const dbName = process.env.MONGODB_DB ?? "nn_investigation";

const CLIENT_OPTIONS: MongoClientOptions = {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
  // eslint-disable-next-line no-var
  var _mongoClientUri: string | undefined;
}

function getUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI não configurada em .env.local");
  }

  if (uri.startsWith("mongodb+srv://")) {
    console.warn(
      "[mongodb] URI mongodb+srv detectada. Em algumas redes Windows ocorre querySrv ECONNREFUSED. " +
        "Use a connection string padrão do Atlas (Connect → Drivers → Standard)."
    );
  }

  return uri;
}

function getClient(): MongoClient {
  const uri = getUri();

  if (!global._mongoClient || global._mongoClientUri !== uri) {
    global._mongoClient = new MongoClient(uri, CLIENT_OPTIONS);
    global._mongoClientUri = uri;
  }

  return global._mongoClient;
}

export async function getDb(): Promise<Db> {
  const client = getClient();
  await client.connect();
  return client.db(dbName);
}

export async function pingMongo(): Promise<boolean> {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}
