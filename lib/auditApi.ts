// auditApi.ts

import { graphqlFetch } from "./graphql";

export async function fetchAuditsReceived(userId: number) {
  const query = `
    query getAudits($auditorId: Int!) {
      auditsReceived: audit(where: { auditorId: { _neq: $auditorId } }) {
        grade
      }
    }
  `;
  const data = await graphqlFetch(query, { auditorId: userId });
  return data.auditsReceived
    .map((item: any) => item.grade)
    .filter((grade: any) => grade !== null && !isNaN(grade));
}

export async function fetchAuditsDone(userId: number) {
  const query = `
    query getAudits($auditorId: Int!) {
      auditsDone: audit(where: { auditorId: { _eq: $auditorId } }) {
        grade
      }
    }
  `;
  const data = await graphqlFetch(query, { auditorId: userId });
  return data.auditsDone
    .map((item: any) => item.grade)
    .filter((grade: any) => grade !== null && !isNaN(grade));
}

export async function fetchXpUp(userId: number) {
  const query = `
    query getXp($auditorId: Int!) {
      xpUp: transaction_aggregate(
        where: { userId: { _eq: $auditorId }, type: { _eq: "up" } }
      ) {
        aggregate {
          sum { amount }
        }
      }
    }
  `;
  const data = await graphqlFetch(query, { auditorId: userId });
  return data.xpUp.aggregate.sum.amount || 0;
}

export async function fetchXpDown(userId: number) {
  const query = `
    query getXp($auditorId: Int!) {
      xpDown: transaction_aggregate(
        where: { userId: { _eq: $auditorId }, type: { _eq: "down" } }
      ) {
        aggregate {
          sum { amount }
        }
      }
    }
  `;
  const data = await graphqlFetch(query, { auditorId: userId });
  return data.xpDown.aggregate.sum.amount || 0;
}

export async function calculateXpRatio(userId: number) {
  const xpUp = Number(await fetchXpUp(userId));
  const xpDown = Number(await fetchXpDown(userId));

  const ratio = xpDown === 0 ? xpUp : xpUp / xpDown;

  return {
    xpUp,
    xpDown,
    ratio: ratio.toFixed(1),
  };
}

export async function fetchXpPerMonth(): Promise<
  { date: string; xp: number }[]
> {
  const query = `
    query {
      transaction(
        where: { 
          type: { _eq: "xp" }, 
          event: { object: { name: { _eq: "Module" } } } 
        }, 
        order_by: { id: asc }
      ) {
        id
        amount
        createdAt
      }
    }
  `;
  const data = await graphqlFetch(query);

  const transactions: { id: number; amount: number; createdAt: string }[] =
    data.transaction || [];

  const xpPerMonth = transactions.reduce<Record<string, number>>((acc, txn) => {
    const date = new Date(txn.createdAt);
    const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
    acc[yearMonth] = (acc[yearMonth] || 0) + txn.amount;
    return acc;
  }, {});

  return Object.entries(xpPerMonth).map(([date, xp]) => ({ date, xp }));
}

export async function fetchTotalXp(userId: number) {
  const xpUp = Number(await fetchXpUp(userId));
  const xpDown = Number(await fetchXpDown(userId));

  const xpModule = (await fetchXpPerMonth()).reduce(
    (sum, txn) => sum + txn.xp,
    0
  );

  const totalXp = xpUp - xpDown + xpModule;

  return totalXp;
}
export function formatXp(xp: number) {
  if (xp >= 1_000_000) return (xp / 1_000).toFixed(0) + "k";
  if (xp >= 1_000) return (xp / 1_000).toFixed(1) + "k";
  return xp.toString();
}
