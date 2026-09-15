import { expect, test, type Page } from '@playwright/test'

/**
 * The appointment request flow, end to end.
 *
 * Everything here runs against the real Server Action, the real Zod schema and
 * the real guards — only Postgres and Resend are swapped for in-process
 * doubles. A suite that stubbed the action would pass while the thing it
 * protects was broken.
 *
 * The failure paths matter more than the happy path. The defect this whole
 * phase exists to fix was a form that reported success while transmitting
 * nothing, so "the form tells the truth when something is wrong" is the
 * property under test.
 */

/** A weekday at least a week out, computed in the practice's timezone. */
function nextWeekday(): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + 7)
  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
    date.setUTCDate(date.getUTCDate() + 1)
  }
  return date.toISOString().slice(0, 10)
}

async function fillValidRequest(page: Page, overrides: Record<string, string> = {}) {
  const values: Record<string, string> = {
    fullName: 'Marta Alvarez',
    phone: '(516) 433-1100',
    email: 'marta@example.com',
    preferredDate: nextWeekday(),
    ...overrides,
  }

  await page.getByLabel('Full name').fill(values.fullName ?? '')
  await page.getByLabel('Phone', { exact: true }).fill(values.phone ?? '')
  await page.getByLabel('Email').fill(values.email ?? '')
  await page.getByLabel('Preferred date').fill(values.preferredDate ?? '')
  await page.getByLabel('Preferred time').selectOption('morning')
  await page.getByLabel('Reason for visit').selectOption('Spine Consultation')
}

test.describe('with JavaScript', () => {
  // Distinct address so this block gets its own rate-limit bucket.
  test.use({ extraHTTPHeaders: { 'x-forwarded-for': '198.51.100.11' } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/visit#appointment')
  })

  test('the notes field warns against sending medical detail', async ({ page }) => {
    // The single most important string on the form: without it, patients type
    // symptoms into a box that is not a clinical channel.
    await expect(
      page.getByText(
        'Please do not include detailed medical information. Our staff will collect that by phone.',
      ),
    ).toBeVisible()
  })

  test('an empty submit produces a focused error summary listing every field', async ({ page }) => {
    await page.getByRole('button', { name: 'Request Appointment' }).click()

    // Scoped to the form: Next's route announcer is also `role="alert"`.
    const summary = page.locator('form').getByRole('alert')
    await expect(summary).toBeVisible()
    // Focus must move, or a keyboard user presses the button and nothing
    // appears to happen.
    await expect(summary).toBeFocused()

    await expect(summary.getByRole('link')).toHaveCount(6)
    await expect(page.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true')
  })

  test('each field describes its own error', async ({ page }) => {
    await page.getByLabel('Email').fill('not-an-email')
    await page.getByRole('button', { name: 'Request Appointment' }).click()

    const email = page.getByLabel('Email')
    await expect(email).toHaveAttribute('aria-invalid', 'true')

    const describedBy = await email.getAttribute('aria-describedby')
    expect(describedBy).toContain('email-error')
    await expect(page.locator('#email-error')).toContainText('valid email address')
  })

  test('an error summary link moves focus to the field that needs fixing', async ({ page }) => {
    await page.getByRole('button', { name: 'Request Appointment' }).click()
    await page.locator('form').getByRole('alert').getByRole('link').first().click()

    await expect(page.getByLabel('Full name')).toBeFocused()
  })

  test('a weekend date is refused with the practice’s own wording', async ({ page }) => {
    const saturday = new Date()
    saturday.setUTCDate(saturday.getUTCDate() + 7)
    while (saturday.getUTCDay() !== 6) saturday.setUTCDate(saturday.getUTCDate() + 1)

    await fillValidRequest(page, { preferredDate: saturday.toISOString().slice(0, 10) })
    await page.getByRole('button', { name: 'Request Appointment' }).click()

    await expect(page.locator('form').getByRole('alert')).toContainText(
      'Office is closed on weekends',
    )
  })

  test('correcting a field clears its error without another submit', async ({ page }) => {
    await page.getByRole('button', { name: 'Request Appointment' }).click()
    await expect(page.locator('#fullName-error')).toBeVisible()

    await page.getByLabel('Full name').fill('Marta Alvarez')
    await page.getByLabel('Phone', { exact: true }).click() // blur the name field

    await expect(page.locator('#fullName-error')).toBeHidden()
  })

  test('a valid request succeeds and says plainly that nothing is booked', async ({ page }) => {
    await fillValidRequest(page)
    await page.getByLabel('Anything else we should know').fill('I can only manage mornings.')
    await page.getByRole('button', { name: 'Request Appointment' }).click()

    const success = page.getByRole('status').filter({ hasText: 'Request received' })
    await expect(success).toBeVisible()

    // The sentence the whole success panel exists for.
    await expect(success).toContainText('This is a request, not a confirmed appointment')
    await expect(success).toContainText('Your reference:')
    // And a route out for anyone whose situation cannot wait.
    await expect(success).toContainText('(516) 433-1100')

    // The form is gone, so there is nothing left to submit twice.
    await expect(page.getByRole('button', { name: 'Request Appointment' })).toHaveCount(0)
  })

  test('the honeypot is hidden from assistive technology and the tab order', async ({ page }) => {
    const honeypot = page.locator('#company')
    await expect(honeypot).toHaveAttribute('tabindex', '-1')
    await expect(honeypot).toHaveAttribute('autocomplete', 'off')
    await expect(page.locator('[aria-hidden="true"] #company')).toHaveCount(1)
  })
})

test.describe('without JavaScript', () => {
  test.use({
    javaScriptEnabled: false,
    extraHTTPHeaders: { 'x-forwarded-for': '198.51.100.22' },
  })

  /**
   * The progressive-enhancement proof.
   *
   * The Server Action is handed straight to `useActionState`, so the browser
   * posts the form natively and the same action runs. If someone ever replaces
   * that with a `fetch`, these two tests are what fail.
   */

  test('validation errors come back from the server, with the answers preserved', async ({
    page,
  }) => {
    await page.goto('/visit#appointment')

    await page.getByLabel('Full name').fill('Marta Alvarez')
    await page.getByLabel('Email').fill('not-an-email')
    await page.getByRole('button', { name: 'Request Appointment' }).click()

    await expect(page.locator('form').getByRole('alert')).toBeVisible()
    await expect(page.locator('#email-error')).toContainText('valid email address')
    // Without JS there is no re-render to preserve this — the server has to
    // hand it back, or a nine-field form has to be retyped.
    await expect(page.getByLabel('Full name')).toHaveValue('Marta Alvarez')
  })

  test('a valid request goes through', async ({ page }) => {
    await page.goto('/visit#appointment')
    await fillValidRequest(page)
    await page.getByRole('button', { name: 'Request Appointment' }).click()

    await expect(page.getByText('This is a request, not a confirmed appointment')).toBeVisible()
  })
})
