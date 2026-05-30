import { type NextRequest, NextResponse } from 'next/server';

const BACKEND_API =
  process.env.BACKEND_API_URL ??
  'http://localhost:1981/klicklocal/backend/public/api/v1';

/** Only forward headers Laravel needs — never forward browser cookies. */
function buildBackendHeaders(request: NextRequest): Headers {
  const headers = new Headers();

  const authorization = request.headers.get('authorization');
  if (authorization) {
    headers.set('Authorization', authorization);
  }

  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  headers.set('Accept', 'application/json');

  return headers;
}

async function proxyToBackend(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const path = pathSegments.join('/');
  const search = request.nextUrl.search;
  const url = `${BACKEND_API}/${path}${search}`;

  const hasBody = !['GET', 'HEAD'].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const backendResponse = await fetch(url, {
    method: request.method,
    headers: buildBackendHeaders(request),
    body,
    cache: 'no-store',
  });

  const responseHeaders = new Headers(backendResponse.headers);
  responseHeaders.delete('transfer-encoding');

  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyToBackend(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyToBackend(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyToBackend(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyToBackend(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyToBackend(request, path);
}
