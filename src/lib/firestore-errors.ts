import { supabase } from './supabase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface SupabaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

export async function handleSupabaseError(error: unknown, operationType: OperationType, path: string | null) {
  const session = await supabase.auth.getSession();
  const errInfo: SupabaseErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: session.data.session?.user?.id,
      email: session.data.session?.user?.email,
    },
    operationType,
    path
  }
  const errorJson = JSON.stringify(errInfo);
  console.error('Supabase Error: ', errorJson);
  throw new Error(errorJson);
}
