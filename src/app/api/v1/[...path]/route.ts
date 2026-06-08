import { type NextRequest, NextResponse } from 'next/server';

import { getBackendApiUrl } from '@/lib/backend-api-url';

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

  const workspaceId = request.headers.get('x-workspace-id');
  if (workspaceId) {
    headers.set('X-Workspace-Id', workspaceId);
  }

  headers.set('Accept', 'application/json');

  return headers;
}

async function proxyToBackend(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const backendApi = getBackendApiUrl();
  const path = pathSegments.join('/');
  const search = request.nextUrl.search;
  const url = `${backendApi}/${path}${search}`;

  const hasBody = !['GET', 'HEAD'].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  try {
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
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Backend request failed';
    console.error('[api proxy]', url, message);

    return NextResponse.json(
      {
        success: false,
        message:
          'Cannot reach the API server. Set BACKEND_API_URL to the Laravel API base, e.g. https://api.klicklocal.app/api/v1 (production) or https://api-test.klicklocal.app/api/v1 (staging).',
        detail: message,
      },
      { status: 502 },
    );
  }
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
