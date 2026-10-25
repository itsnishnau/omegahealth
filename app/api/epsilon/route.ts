// Epsilon now runs entirely in the browser with preset FAQs.
export async function POST() {
  return Response.json({error:'Epsilon now uses free preset FAQs. Refresh the page to use the guide.'}, {status:410});
}
