describe('test extension', () => {
  it('should load extension set run attr to <html> tag', () => {
    cy.visit('https://www.mytoys.de/lego-lego-disney-43230-kamera--hommage-an-walt-disney-29981540.html')
    cy.get('.prod-info__price-container').should('have.class', `brickmerge`)
  })
})
