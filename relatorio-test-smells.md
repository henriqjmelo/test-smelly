# Refatoração de Testes e Detecção de Test Smells

## Capa
- **Disciplina:** Teste de Software  
- **Trabalho:** Refatoração de Testes e Detecção de Test Smells  
- **Nome:** Henrique Jardim Melo 
---

## 1. Análise de Test Smells

Durante a análise da suíte de testes original (`userService.smelly.test.js`), identifiquei os seguintes Test Smells:

| Test Smell             | Exemplo no arquivo smelly                          | Problema/Risco                                                                 |
|------------------------|--------------------------------------------------|-------------------------------------------------------------------------------|
| Teste Desativado       | `test.skip('deve retornar uma lista vazia...', ...)` | Não é executado, funcionalidade não testada, pode esconder bugs              |
| Eager Test / Teste gigante | `deve criar e buscar um usuário corretamente`  | Muitas ações e verificações no mesmo teste, difícil identificar falha         |
| Lógica Condicional     | `for (const user of todosOsUsuarios) { if (!user.isAdmin) ... }` | Teste imprevisível e frágil, difícil de manter                                |
| Teste Frágil           | `expect(relatorio.startsWith('--- Relatório de Usuários ---'))` | Quebra facilmente se a formatação mudar, não testa comportamento real        |
| Try/Catch silencioso   | `try { userService.createUser(...); } catch (e) { ... }` | Se a exceção não ocorrer, o teste pode passar silenciosamente                 |

**Comentário:** Esses smells deixam a suíte **difícil de manter, frágil e com baixa confiabilidade**, mesmo que todos os testes passem.

---

## 2. Processo de Refatoração

### Teste problemático 1 – Desativação de usuários

**Original (smelly):**

```javascript
test('deve desativar usuários se eles não forem administradores', () => {
  const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);
  const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);
  const todosOsUsuarios = [usuarioComum, usuarioAdmin];

  for (const user of todosOsUsuarios) {
    const resultado = userService.deactivateUser(user.id);
    if (!user.isAdmin) {
      expect(resultado).toBe(true);
      const usuarioAtualizado = userService.getUserById(user.id);
      expect(usuarioAtualizado.status).toBe('inativo');
    } else {
      expect(resultado).toBe(false);
    }
  }
});
```

### Refatorado (clean):

```javascript
test('não permite desativar usuário administrador', () => {
  const admin = userService.createUser('Admin', 'admin@teste.com', 40, true);
  const resultado = userService.deactivateUser(admin.id);
  expect(resultado).toBe(false);
  const usuarioAtualizado = userService.getUserById(admin.id);
  expect(usuarioAtualizado.status).toBe('ativo');
});

test('desativa usuário comum corretamente', () => {
  const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);
  const resultado = userService.deactivateUser(usuarioComum.id);
  expect(resultado).toBe(true);
  const usuarioAtualizado = userService.getUserById(usuarioComum.id);
  expect(usuarioAtualizado.status).toBe('inativo');
});
```

Decisão: Separei cenários de admin e usuário comum, eliminando if/for e aplicando o padrão AAA.

Teste problemático 2 – Usuário menor de idade

Original (smelly):
```javascript
test('deve falhar ao criar usuário menor de idade', () => {
  try {
    userService.createUser('Menor', 'menor@email.com', 17);
  } catch (e) {
    expect(e.message).toBe('O usuário deve ser maior de idade.');
  }
});
```
### Refatorado (clean):

```javascript
test('não permite criar usuário menor de idade', () => {
  expect(() => userService.createUser('Menor', 'menor@email.com', 17))
    .toThrow('O usuário deve ser maior de idade.');
});
```
Decisão: Uso direto de toThrow evita falsos positivos e deixa o teste mais legível.

Teste problemático 3 – Relatório de usuários

Original (smelly):
```javascript
test('deve gerar um relatório de usuários formatado', () => {
  const usuario1 = userService.createUser('Alice', 'alice@email.com', 28);
  userService.createUser('Bob', 'bob@email.com', 32);

  const relatorio = userService.generateUserReport();
  const linhaEsperada = `ID: ${usuario1.id}, Nome: Alice, Status: ativo\n`;
  expect(relatorio).toContain(linhaEsperada);
  expect(relatorio.startsWith('--- Relatório de Usuários ---')).toBe(true);
});
```
### Refatorado (clean):

```javascript
test('gera relatório de usuários corretamente', () => {
  const usuario1 = userService.createUser('Alice', 'alice@email.com', 28);
  userService.createUser('Bob', 'bob@email.com', 32);

  const relatorio = userService.generateUserReport();
  expect(relatorio).toContain(`ID: ${usuario1.id}, Nome: Alice, Status: ativo\n`);
  expect(relatorio.startsWith('--- Relatório de Usuários ---')).toBe(true);
});
```

Decisão: Mantive validação comportamental, evitando fragilidade se a formatação mudar levemente.


