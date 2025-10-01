const END_POINT = "https://learn.reboot01.com/api/graphql-engine/v1/graphql";

export async function FetchSkills(userID: number) {
  const query = `
        query {
            transaction(
                where: { type: { _like: "%skill_%" } }
                order_by: { id: asc }
              ) {
                amount
                type
              }
        }
    `;

  try {
    const response = await fetch(END_POINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    const skills = data.data.transaction;

    const summedSkills = skills.reduce((acc: any, curr: any) => {
      const { type, amount } = curr;
      if (acc[type]) {
        acc[type] += amount;
      } else {
        acc[type] = amount;
      }
      return acc;
    }, {});

    const result = Object.keys(summedSkills).map((type) => ({
      type,
      totalAmount: summedSkills[type],
    }));

    return result;
  } catch (err) {
    console.error("Error fetching skills data:", err);
    throw err;
  }
}
