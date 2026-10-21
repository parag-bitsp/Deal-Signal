import {NextResponse} from 'next/server';
import {getStore} from '../../../lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!getStore().db.prepare('SELECT id FROM opportunities LIMIT 1').get()) {
      throw new Error('Demo dataset is unavailable');
    }
    return NextResponse.json({status: 'ok', database: 'ready'}, {headers: {'Cache-Control': 'no-store'}});
  } catch {
    return NextResponse.json({status: 'unavailable'}, {status: 503, headers: {'Cache-Control': 'no-store'}});
  }
}
