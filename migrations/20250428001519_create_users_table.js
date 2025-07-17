exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('username').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.timestamps(true, true);  // created_at ve updated_at zamanları
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};
