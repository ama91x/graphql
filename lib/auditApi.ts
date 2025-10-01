// auditApi.ts

import { graphqlFetch } from "./graphql";

interface Audit {
  grade: number | null;
}

interface Transaction {
  id: number;
  amount: number;
  createdAt: string;
}

interface TransactionAggregate {
  aggregate: {
    sum: { amount: number | null };
  };
}

function extractGrades(audits: Audit[]): number[] {
  return audits
    .map((a) => a.grade)
    .filter((g): g is number => g !== null && !isNaN(g));
}
export async function fetchAuditsReceived(userId: number): Promise<number[]> {
  const query = `
    query getAudits($auditorId: Int!) {
      auditsReceived: audit(where: { auditorId: { _neq: $auditorId } }) {
        grade
      }
    }
  `;
  const data: { auditsReceived: Audit[] } = await graphqlFetch(query, {
    auditorId: userId,
  });
  return extractGrades(data.auditsReceived);
}

export async function fetchAuditsDone(userId: number): Promise<number[]> {
  const query = `
    query getAudits($auditorId: Int!) {
      auditsDone: audit(where: { auditorId: { _eq: $auditorId } }) {
        grade
      }
    }
  `;
  const data: { auditsDone: Audit[] } = await graphqlFetch(query, {
    auditorId: userId,
  });
  return extractGrades(data.auditsDone);
}

export async function fetchXpUp(userId: number): Promise<number> {
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
  const data: { xpUp: TransactionAggregate } = await graphqlFetch(query, {
    auditorId: userId,
  });
  return data.xpUp.aggregate.sum.amount ?? 0;
}

export async function fetchXpDown(userId: number): Promise<number> {
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
  const data: { xpDown: TransactionAggregate } = await graphqlFetch(query, {
    auditorId: userId,
  });
  return data.xpDown.aggregate.sum.amount ?? 0;
}

export async function calculateXpRatio(userId: number): Promise<{
  xpUp: number;
  xpDown: number;
  ratio: string;
}> {
  const xpUp = await fetchXpUp(userId);
  const xpDown = await fetchXpDown(userId);
  const ratio = xpDown === 0 ? xpUp : xpUp / xpDown;
  return { xpUp, xpDown, ratio: ratio.toFixed(1) };
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
  const data: { transaction: Transaction[] } = await graphqlFetch(query);
  const transactions = data.transaction || [];

  const xpPerMonth = transactions.reduce<Record<string, number>>((acc, txn) => {
    const date = new Date(txn.createdAt);
    const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
    acc[yearMonth] = (acc[yearMonth] || 0) + txn.amount;
    return acc;
  }, {});

  return Object.entries(xpPerMonth).map(([date, xp]) => ({ date, xp }));
}

export async function fetchTotalXp(userId: number): Promise<number> {
  const xpUp = await fetchXpUp(userId);
  const xpDown = await fetchXpDown(userId);
  const xpModule = (await fetchXpPerMonth()).reduce(
    (sum, txn) => sum + txn.xp,
    0
  );
  return xpUp - xpDown + xpModule;
}

export function formatXp(xp: number): string {
  if (xp >= 1_000_000) return (xp / 1_000).toFixed(0) + "k";
  if (xp >= 1_000) return (xp / 1_000).toFixed(1) + "k";
  return xp.toString();
}
