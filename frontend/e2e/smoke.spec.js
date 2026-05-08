import { test, expect } from '@playwright/test'

const USERNAME = process.env.E2E_USERNAME || 'alice'
const PASSWORD = process.env.E2E_PASSWORD || 'password'

async function login(page) {
  await page.goto('/login')
  await page.getByPlaceholder('Username or Email').fill(USERNAME)
  await page.getByPlaceholder('Password').fill(PASSWORD)
  const loginResponsePromise = page.waitForResponse((res) => {
    return res.url().includes('/api/auth/login') && res.request().method() === 'POST'
  })

  await page.getByRole('button', { name: 'Login' }).click()
  const loginRes = await loginResponsePromise
  expect(loginRes.ok(), `Login failed: ${loginRes.status()} ${loginRes.statusText()}`).toBeTruthy()

  // Ensure we didn't stay on the login page due to a UI-level error.
  await expect(page.getByText('Invalid credentials')).toHaveCount(0)

  // Dashboard route is '/'
  await expect(page).toHaveURL(/\/($|\?)/)
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
}

test('smoke: login loads dashboard', async ({ page }) => {
  await login(page)
})

test('smoke: create team -> view tasks -> create task -> change status', async ({ page }) => {
  await login(page)

  // Create team
  await page.goto('/teams')
  await page.getByRole('button', { name: /new team/i }).click()

  const teamName = `E2E Team ${Date.now()}`
  await page.getByLabel('Name').fill(teamName)
  await page.getByLabel('Description').fill('Created by Playwright smoke test')
  await page.getByRole('button', { name: 'Create' }).click()

  // Confirm team card exists
  await expect(page.getByText(teamName)).toBeVisible()

  // View tasks for the created team
  const teamCard = page.locator('.card-surface', { hasText: teamName }).first()
  await teamCard.getByRole('button', { name: /view tasks/i }).click()
  await expect(page).toHaveURL(/\/tasks\?teamId=\d+/)

  // Important: wait for the Tasks page initial load to finish, otherwise the
  // async loader can overwrite the task list after we submit the create form.
  await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible()
  await expect(page.getByText(/posting into team view/i)).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText(/loading tasks/i)).toHaveCount(0, { timeout: 30_000 })

  const teamId = new URL(page.url()).searchParams.get('teamId')
  expect(teamId, 'Expected teamId query param on /tasks page').toBeTruthy()
  await expect(page.locator('#task-create-team')).toHaveValue(teamId, { timeout: 30_000 })

  // Create task (inside Create task card)
  const taskTitle = `E2E Task ${Date.now()}`
  await page.getByLabel('Title').fill(taskTitle)
  await page.getByLabel('Description').fill('Created by Playwright')

  const createTaskResponsePromise = page.waitForResponse((res) => {
    return (
      res.url().includes('/api/tasks') &&
      res.request().method() === 'POST' &&
      res.status() >= 200 &&
      res.status() < 300
    )
  })

  const reloadTasksResponsePromise = page.waitForResponse((res) => {
    return (
      res.url().includes(`/api/tasks/team/${teamId}`) &&
      res.request().method() === 'GET' &&
      res.status() >= 200 &&
      res.status() < 300
    )
  })

  await page.getByRole('button', { name: /^create$/i }).click()
  const [createTaskResponse] = await Promise.all([
    createTaskResponsePromise,
    reloadTasksResponsePromise,
  ])
  expect(createTaskResponse.ok()).toBeTruthy()

  await expect(page.getByRole('status')).toContainText(/task created/i)

  // Verify task appears
  const taskCard = page.locator('.card-surface', { hasText: taskTitle }).first()
  console.log('Checking for taskCard with title:', taskTitle)
  await expect(taskCard).toBeVisible({ timeout: 30_000 })

  // Verify assignee visible (creator assigned by UI)
  await expect(taskCard.getByText(/assignees/i)).toBeVisible()
  // Avoid strict-mode ambiguity: the assignee name also appears in the "Assign someone" dropdown.
  await expect(taskCard.getByRole('button', { name: /unassign/i })).toBeVisible()

  // Change status to DONE
  const statusSelect = taskCard.getByRole('combobox').first()
  await statusSelect.selectOption('DONE')
  await expect(statusSelect).toHaveValue('DONE')
})
