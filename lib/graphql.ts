export async function graphqlFetch(
  query: string,
  variables?: Record<string, unknown>
) {
  let token = localStorage.getItem("rb01_jwt");
  if (!token) throw new Error("No JWT found, please login.");

  token = token.replace(/^"|"$/g, "");

  const res = await fetch(
    "https://learn.reboot01.com/api/graphql-engine/v1/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const json = await res.json();

  if (!res.ok || json.errors) {
    const errMsg = json.errors
      ? JSON.stringify(json.errors)
      : `${res.status} ${res.statusText}`;
    throw new Error(errMsg);
  }

  return json.data;
}
