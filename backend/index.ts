import { getKnex, logger, post, wait } from "./lib";

export const fetchEosTransactions = async (account: string) => {
  const knex = await getKnex();

  let [currentSequence] = await knex("account_sequence").where("name", account);

  if (!currentSequence) {
    [currentSequence] = await knex("account_sequence")
      .insert({
        name: account,
        sequence: 0,
      })
      .returning("*");
  }

  const position = currentSequence.sequence;

  logger.info("OK", { account_name: account, pos: position, offset: 20 });
  const transactions = await post(
    "https://eos.greymass.com/v1/history/get_actions",
    (data) => data,
    { body: { account_name: account, pos: position, offset: 20 } }
  );

  const splitQuantity = (quan: string) => {
    const [amount, token] = quan.split(" ");

    return { amount, token };
  };

  const parseAmount = (str: string) => {
    const { amount } = splitQuantity(str);
    return amount;
  };

  const parseToken = (str: string) => {
    const { token } = splitQuantity(str);
    return token;
  };

  await knex("account_transaction")
    .insert(
      transactions.actions
        .filter(
          (action: any) => action.action_trace.act.account === "eosio.token"
        )
        .map((action: any) => {
          const { from } = action.action_trace.act.data;
          const { to } = action.action_trace.act.data;
          return {
            id: action.action_trace.trx_id,
            from,
            to,
            sequence:
              to === account
                ? action.action_trace.receipt.recv_sequence
                : action.action_trace.receipt.auth_sequence.filter(
                    ([accountName]: [string]) => accountName === account
                  )[0][1],
            amount: parseAmount(action.action_trace.act.data.quantity),
            token: parseToken(action.action_trace.act.data.quantity),
            created_at: new Date(),
            transaction_created_at: action.block_time,
          };
        })
    )
    .onConflict("id")
    .ignore();
  logger.info(`processed_transactions`, { count: transactions.length });
  await knex("account_sequence").update("sequence", knex.raw("sequence + 10"));
  return { done: transactions.length === 0 };
};

const start = async () => {
  const [, , account = "stakecasino1"] = process.argv;
  try {
    let result = await fetchEosTransactions(account);
    while (!result.done) {
      result = await fetchEosTransactions(account);
    }

    logger.info("no_more_transactions_retrying_in_10_seconds");

    await wait(10000);
    start();
  } catch (e) {
    logger.warn("error_fetching....");
    await wait(10000);
    logger.info("retrying...");
    start();
  }
};

start();
