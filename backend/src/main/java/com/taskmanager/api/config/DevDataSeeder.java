package com.taskmanager.api.config;

import com.taskmanager.api.entity.Role;
import com.taskmanager.api.entity.Team;
import com.taskmanager.api.entity.Task;
import com.taskmanager.api.entity.User;
import com.taskmanager.api.entity.Priority;
import com.taskmanager.api.entity.Status;
import com.taskmanager.api.repository.RoleRepository;
import com.taskmanager.api.repository.TeamRepository;
import com.taskmanager.api.repository.TaskRepository;
import com.taskmanager.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Configuration
@Profile("dev")
@SuppressWarnings("null")
public class DevDataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepo;
    private final UserRepository userRepo;
    private final TeamRepository teamRepo;
    private final TaskRepository taskRepo;
    private final PasswordEncoder passwordEncoder;

    public DevDataSeeder(RoleRepository roleRepo, UserRepository userRepo, TeamRepository teamRepo, TaskRepository taskRepo, PasswordEncoder passwordEncoder) {
        this.roleRepo = roleRepo;
        this.userRepo = userRepo;
        this.teamRepo = teamRepo;
        this.taskRepo = taskRepo;
        this.passwordEncoder = passwordEncoder;
    }

    private User upsertUser(String username, String email, String displayName, Set<Role> roles) {
        @SuppressWarnings("null")
        Optional<User> existing = userRepo.findByUsername(username);
        User u = existing.orElseGet(User::new);
        u.setUsername(username);
        u.setEmail(email);
        u.setDisplayName(displayName);
        u.setRoles(new HashSet<>(roles));

        // In dev we keep demo credentials stable for onboarding + E2E.
        u.setPassword(passwordEncoder.encode("password"));
        return userRepo.save(u);
    }

    private Team upsertTeam(String name, String description, User admin, Set<User> members) {
        Team t = teamRepo.findByName(name).orElseGet(Team::new);
        t.setName(name);
        t.setDescription(description);
        t.setAdmin(admin);

        // Ensure members are present even if the team already existed.
        t.getMembers().clear();
        t.getMembers().addAll(members);
        return teamRepo.save(t);
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        Role userRole = roleRepo.findByName("ROLE_USER").orElseGet(() -> roleRepo.save(new Role("ROLE_USER")));
        Role adminRole = roleRepo.findByName("ROLE_ADMIN").orElseGet(() -> roleRepo.save(new Role("ROLE_ADMIN")));

        // Demo credentials used by README + Playwright smoke
        User alice = upsertUser("alice", "alice@example.com", "Alice A.", Set.of(userRole));
        User bob = upsertUser("bob", "bob@example.com", "Bob B.", Set.of(userRole, adminRole));
        User charlie = upsertUser("charlie", "charlie@example.com", "Charlie C.", Set.of(userRole));
        User dana = upsertUser("dana", "dana@example.com", "Dana D.", Set.of(userRole));

        Team alpha = upsertTeam("Alpha Team", "Product team focused on core features.", bob, Set.of(alice, bob, charlie));
        Team beta = upsertTeam("Beta Team", "Internal tooling & QA improvements.", alice, Set.of(alice, bob, dana));
        Team gamma = upsertTeam("Gamma Team", "Customer success workflows and support ops.", bob, Set.of(bob, charlie));

        // A richer task set so the dashboard has meaningful stats
        LocalDateTime now = LocalDateTime.now();

        Task t1 = new Task();
        t1.setTitle("Design landing page");
        t1.setDescription("Create first draft for marketing landing page.");
        t1.setCreator(alice);
        t1.setTeam(alpha);
        t1.setPriority(Priority.MEDIUM);
        t1.setStatus(Status.TO_DO);
        t1.setDueDate(now.plusDays(7));
        t1.getAssignees().add(alice);

        Task t2 = new Task();
        t2.setTitle("Implement auth API");
        t2.setDescription("Finish JWT login, refresh tokens and tests.");
        t2.setCreator(bob);
        t2.setTeam(alpha);
        t2.setPriority(Priority.HIGH);
        t2.setStatus(Status.IN_PROGRESS);
        t2.setDueDate(now.plusDays(2));
        t2.getAssignees().add(alice);
        t2.getAssignees().add(bob);

        Task t3 = new Task();
        t3.setTitle("Fix flaky CI build");
        t3.setDescription("Investigate intermittent failures and stabilize pipeline.");
        t3.setCreator(bob);
        t3.setTeam(beta);
        t3.setPriority(Priority.HIGH);
        t3.setStatus(Status.BLOCKED);
        t3.setDueDate(now.plusDays(1));
        t3.getAssignees().add(alice);

        Task t4 = new Task();
        t4.setTitle("Add dashboard stats");
        t4.setDescription("Show task breakdown, due soon, and key metrics.");
        t4.setCreator(alice);
        t4.setTeam(beta);
        t4.setPriority(Priority.MEDIUM);
        t4.setStatus(Status.DONE);
        t4.setDueDate(now.minusDays(4));
        t4.getAssignees().add(alice);

        Task t5 = new Task();
        t5.setTitle("Refactor task list UI");
        t5.setDescription("Improve readability and mobile layout.");
        t5.setCreator(alice);
        t5.setTeam(alpha);
        t5.setPriority(Priority.LOW);
        t5.setStatus(Status.TO_DO);
        t5.setDueDate(now.plusDays(10));
        t5.getAssignees().add(charlie);

        Task t6 = new Task();
        t6.setTitle("On-call rotation draft");
        t6.setDescription("Draft weekly rotation and escalation policy.");
        t6.setCreator(bob);
        t6.setTeam(gamma);
        t6.setPriority(Priority.MEDIUM);
        t6.setStatus(Status.IN_PROGRESS);
        t6.setDueDate(now.plusDays(5));
        t6.getAssignees().add(charlie);

        Task t7 = new Task();
        t7.setTitle("Clean up old support tickets");
        t7.setDescription("Archive resolved tickets and update tags.");
        t7.setCreator(charlie);
        t7.setTeam(gamma);
        t7.setPriority(Priority.LOW);
        t7.setStatus(Status.DONE);
        t7.setDueDate(now.minusDays(2));
        t7.getAssignees().add(charlie);

        Task t8 = new Task();
        t8.setTitle("Write user onboarding checklist");
        t8.setDescription("Document onboarding steps for new team members.");
        t8.setCreator(dana);
        t8.setTeam(beta);
        t8.setPriority(Priority.MEDIUM);
        t8.setStatus(Status.TO_DO);
        t8.setDueDate(now.plusDays(3));
        t8.getAssignees().add(dana);

        Task t9 = new Task();
        t9.setTitle("Review sprint backlog");
        t9.setDescription("Triage incoming tasks and set priorities.");
        t9.setCreator(bob);
        t9.setTeam(alpha);
        t9.setPriority(Priority.HIGH);
        t9.setStatus(Status.IN_PROGRESS);
        t9.setDueDate(now.plusDays(3));
        t9.getAssignees().add(bob);

        Task t10 = new Task();
        t10.setTitle("Overdue demo task");
        t10.setDescription("Intentionally overdue so dashboard shows overdue count.");
        t10.setCreator(alice);
        t10.setTeam(alpha);
        t10.setPriority(Priority.MEDIUM);
        t10.setStatus(Status.TO_DO);
        t10.setDueDate(now.minusDays(1));
        t10.getAssignees().add(alice);

        taskRepo.saveAll(List.of(t1, t2, t3, t4, t5, t6, t7, t8, t9, t10));
    }
}
