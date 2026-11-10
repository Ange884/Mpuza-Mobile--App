const UPSTREAM = 'https://api.mpuza.com/api';

type RouteContext = {
  params?: { path?: string | string[] };
  path?: string | string[];
};

function parts(context: RouteContext) {
  const raw = context.params?.path ?? context.path ?? [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.flatMap((part) => part.split('/')).filter(Boolean);
}

/** Same-origin forwarder so the browser can reach Mpuza from Expo's port. */
async function forward(request: Request, context: RouteContext) {
  const incoming = new URL(request.url);
  const target = `${UPSTREAM}/${parts(context).map((part) => encodeURIComponent(part)).join('/')}${incoming.search}`;
  const headers = new Headers();
  const authorization = request.headers.get('authorization');
  const contentType = request.headers.get('content-type');
  const accept = request.headers.get('accept');
  if (authorization) headers.set('Authorization', authorization);
  if (contentType) headers.set('Content-Type', contentType);
  if (accept) headers.set('Accept', accept);

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
  });

  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get('content-type');
  if (upstreamType) responseHeaders.set('Content-Type', upstreamType);
  return new Response(await upstream.arrayBuffer(), { status: upstream.status, headers: responseHeaders });
}

export function GET(request: Request, context: RouteContext) {
  return forward(request, context);
}

export function POST(request: Request, context: RouteContext) {
  return forward(request, context);
}

export function PUT(request: Request, context: RouteContext) {
  return forward(request, context);
}

export function PATCH(request: Request, context: RouteContext) {
  return forward(request, context);
}

export function DELETE(request: Request, context: RouteContext) {
  return forward(request, context);
}
