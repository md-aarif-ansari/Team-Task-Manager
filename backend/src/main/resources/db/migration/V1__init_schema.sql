-- V1: Initial schema for TaskManager

CREATE TABLE roles (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(150) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE users_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_users_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_users_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE teams (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  admin_id BIGINT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  CONSTRAINT fk_teams_admin FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE TABLE teams_members (
  team_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (team_id, user_id),
  CONSTRAINT fk_teams_members_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  CONSTRAINT fk_teams_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  creator_id BIGINT,
  team_id BIGINT,
  due_date TIMESTAMP,
  priority VARCHAR(32),
  status VARCHAR(32),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  CONSTRAINT fk_tasks_creator FOREIGN KEY (creator_id) REFERENCES users(id),
  CONSTRAINT fk_tasks_team FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE tasks_assignees (
  task_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (task_id, user_id),
  CONSTRAINT fk_tasks_assignees_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_assignees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
