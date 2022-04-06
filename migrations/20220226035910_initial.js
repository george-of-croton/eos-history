/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  await knex.schema.createTable('account_transaction', (table) => {
    table.string('id').primary().index();
    table.integer('sequence').index();
    table.string('to').notNullable();
    table.string('from').notNullable();
    table.float('amount').notNullable();
    table.string('token').notNullable();
    table.timestamp('transaction_created_at');
    table.timestamp('created_at');

    table.unique(['to', 'from', 'id']);
  });
  await knex.schema.createTable('account_sequence', (table) => {
    table.string('name').notNullable();
    table.integer('sequence').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {};
