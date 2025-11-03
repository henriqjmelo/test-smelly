const { UserService } = require('../src/userService');

describe('UserService - Suíte de Testes Limpos', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  test('cria um usuário corretamente', () => {
    // Arrange
    const nome = 'Fulano de Tal';
    const email = 'fulano@teste.com';
    const idade = 25;

    // Act
    const usuarioCriado = userService.createUser(nome, email, idade);

    // Assert
    expect(usuarioCriado.id).toBeDefined();
    expect(usuarioCriado.nome).toBe(nome);
    expect(usuarioCriado.status).toBe('ativo');
  });

  test('busca usuário por ID corretamente', () => {
    // Arrange
    const usuario = userService.createUser('Fulano de Tal', 'fulano@teste.com', 25);

    // Act
    const usuarioBuscado = userService.getUserById(usuario.id);

    // Assert
    expect(usuarioBuscado.nome).toBe('Fulano de Tal');
    expect(usuarioBuscado.status).toBe('ativo');
  });

  test('não permite desativar usuário administrador', () => {
    // Arrange
    const admin = userService.createUser('Admin', 'admin@teste.com', 40, true);

    // Act
    const resultado = userService.deactivateUser(admin.id);

    // Assert
    expect(resultado).toBe(false);
    const usuarioAtualizado = userService.getUserById(admin.id);
    expect(usuarioAtualizado.status).toBe('ativo');
  });

  test('desativa usuário comum corretamente', () => {
    // Arrange
    const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

    // Act
    const resultado = userService.deactivateUser(usuarioComum.id);

    // Assert
    expect(resultado).toBe(true);
    const usuarioAtualizado = userService.getUserById(usuarioComum.id);
    expect(usuarioAtualizado.status).toBe('inativo');
  });

  test('gera relatório de usuários corretamente', () => {
    // Arrange
    const usuario1 = userService.createUser('Alice', 'alice@email.com', 28);
    userService.createUser('Bob', 'bob@email.com', 32);

    // Act
    const relatorio = userService.generateUserReport();

    // Assert
    expect(relatorio).toContain(`ID: ${usuario1.id}, Nome: Alice, Status: ativo\n`);
    expect(relatorio.startsWith('--- Relatório de Usuários ---')).toBe(true);
  });

  test('não permite criar usuário menor de idade', () => {
    // Arrange
    const nome = 'Menor';
    const email = 'menor@email.com';
    const idade = 17;

    // Act & Assert
    expect(() => userService.createUser(nome, email, idade))
      .toThrow('O usuário deve ser maior de idade.');
  });

  test('retorna lista vazia quando não há usuários', () => {
    // Arrange & Act
    const usuarios = userService.getAllUsers();

    // Assert
    expect(usuarios).toEqual([]);
  });
});