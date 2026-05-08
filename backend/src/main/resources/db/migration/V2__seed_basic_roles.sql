-- V2: Seed basic roles used by the application

INSERT INTO roles(name) VALUES ('ROLE_USER') ON CONFLICT DO NOTHING;
INSERT INTO roles(name) VALUES ('ROLE_ADMIN') ON CONFLICT DO NOTHING;
