describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display login page when not authenticated', () => {
    cy.url().should('include', '/login');
    cy.get('[data-testid="login-form"]').should('be.visible');
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="login-button"]').should('be.visible');
  });

  it('should show validation errors for invalid input', () => {
    cy.get('[data-testid="login-button"]').click();
    
    // Check for validation messages
    cy.get('.ant-form-item-explain-error').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    // Mock successful login
    cy.intercept('POST', '/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'ADMIN',
          },
        },
      },
    }).as('loginRequest');

    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('Password123!');
    cy.get('[data-testid="login-button"]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
  });

  it('should show error message for invalid credentials', () => {
    // Mock failed login
    cy.intercept('POST', '/auth/login', {
      statusCode: 401,
      body: {
        success: false,
        message: 'Invalid credentials',
      },
    }).as('loginRequest');

    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();

    cy.wait('@loginRequest');
    cy.get('.ant-message-error').should('be.visible');
  });

  it('should logout successfully', () => {
    // First login
    cy.intercept('POST', '/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'ADMIN',
          },
        },
      },
    }).as('loginRequest');

    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('Password123!');
    cy.get('[data-testid="login-button"]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');

    // Then logout
    cy.get('[data-testid="logout-button"]').click();
    cy.url().should('include', '/login');
  });
});

describe('Dashboard Access', () => {
  it('should redirect to login when accessing protected route without authentication', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('should access dashboard after successful login', () => {
    // Mock successful login
    cy.intercept('POST', '/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'ADMIN',
          },
        },
      },
    }).as('loginRequest');

    // Mock permissions request
    cy.intercept('GET', '/permissions/my', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          userId: '1',
          role: 'ADMIN',
          permissions: [
            {
              resource: 'DASHBOARD',
              permissions: ['READ'],
            },
          ],
        },
      },
    }).as('permissionsRequest');

    cy.visit('/');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('Password123!');
    cy.get('[data-testid="login-button"]').click();

    cy.wait('@loginRequest');
    cy.wait('@permissionsRequest');
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="dashboard-title"]').should('be.visible');
  });
});
