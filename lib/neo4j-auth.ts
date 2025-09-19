// lib/neo4j-auth.ts
// Neo4j-based authentication utilities

import bcrypt from 'bcryptjs';
import { queryNeo4j } from './neo4j';

export interface Neo4jUser {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: string;
  created_at: string;
  updated_at: string;
}

/**
 * Creates a new user in Neo4j
 * @param {Object} userData - User data
 * @returns {Promise<Neo4jUser>} Created user
 */
export async function createUserInNeo4j(userData: {
  email: string;
  name: string;
  password: string;
  role?: string;
}): Promise<Neo4jUser> {
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const password_hash = await bcrypt.hash(userData.password, 12);
  const role = userData.role || 'STUDENT';
  
  const query = `
    CREATE (u:User {
      id: $userId,
      email: $email,
      name: $name,
      password_hash: $password_hash,
      role: $role,
      created_at: datetime(),
      updated_at: datetime()
    })
    RETURN u
  `;
  
  const parameters = {
    userId,
    email: userData.email,
    name: userData.name,
    password_hash,
    role
  };
  
  try {
    const result = await queryNeo4j(query, parameters);
    if (result.length === 0) {
      throw new Error('Failed to create user');
    }
    
    const user = result[0].u.properties;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password_hash: user.password_hash,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  } catch (error) {
    console.error('Erro ao criar usuário no Neo4j:', error);
    throw error;
  }
}

/**
 * Finds a user by email in Neo4j
 * @param {string} email - User email
 * @returns {Promise<Neo4jUser|null>} User or null if not found
 */
export async function findUserByEmailInNeo4j(email: string): Promise<Neo4jUser | null> {
  const query = `
    MATCH (u:User {email: $email})
    RETURN u
  `;
  
  const parameters = { email };
  
  try {
    const result = await queryNeo4j(query, parameters);
    if (result.length === 0) return null;
    
    const user = result[0].u.properties;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password_hash: user.password_hash,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  } catch (error) {
    console.error('Erro ao buscar usuário no Neo4j:', error);
    throw error;
  }
}

/**
 * Finds a user by ID in Neo4j
 * @param {string} id - User ID
 * @returns {Promise<Neo4jUser|null>} User or null if not found
 */
export async function findUserByIdInNeo4j(id: string): Promise<Neo4jUser | null> {
  const query = `
    MATCH (u:User {id: $id})
    RETURN u
  `;
  
  const parameters = { id };
  
  try {
    const result = await queryNeo4j(query, parameters);
    if (result.length === 0) return null;
    
    const user = result[0].u.properties;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password_hash: user.password_hash,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  } catch (error) {
    console.error('Erro ao buscar usuário por ID no Neo4j:', error);
    throw error;
  }
}

/**
 * Updates a user in Neo4j
 * @param {string} id - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Neo4jUser>} Updated user
 */
export async function updateUserInNeo4j(id: string, updateData: Partial<{
  name: string;
  email: string;
  password: string;
  role: string;
}>): Promise<Neo4jUser> {
  const setClauses = [];
  const parameters: any = { id };
  
  if (updateData.name) {
    setClauses.push('u.name = $name');
    parameters.name = updateData.name;
  }
  
  if (updateData.email) {
    setClauses.push('u.email = $email');
    parameters.email = updateData.email;
  }
  
  if (updateData.password) {
    const password_hash = await bcrypt.hash(updateData.password, 12);
    setClauses.push('u.password_hash = $password_hash');
    parameters.password_hash = password_hash;
  }
  
  if (updateData.role) {
    setClauses.push('u.role = $role');
    parameters.role = updateData.role;
  }
  
  setClauses.push('u.updated_at = datetime()');
  
  const query = `
    MATCH (u:User {id: $id})
    SET ${setClauses.join(', ')}
    RETURN u
  `;
  
  try {
    const result = await queryNeo4j(query, parameters);
    if (result.length === 0) {
      throw new Error('User not found');
    }
    
    const user = result[0].u.properties;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password_hash: user.password_hash,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  } catch (error) {
    console.error('Erro ao atualizar usuário no Neo4j:', error);
    throw error;
  }
}

/**
 * Verifies user password
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Creates initial admin user if no users exist
 * @returns {Promise<void>}
 */
export async function createInitialAdminUser(): Promise<void> {
  try {
    // Check if any users exist
    const checkQuery = `
      MATCH (u:User)
      RETURN count(u) as userCount
    `;
    
    const result = await queryNeo4j(checkQuery);
    const userCount = result[0]?.userCount || 0;
    
    if (userCount === 0) {
      console.log('🔐 Creating initial admin user...');
      
      await createUserInNeo4j({
        email: 'admin@hubedu.ia',
        name: 'Administrador',
        password: 'admin123',
        role: 'ADMIN'
      });
      
      console.log('✅ Initial admin user created: admin@hubedu.ia / admin123');
    }
  } catch (error) {
    console.error('Erro ao criar usuário admin inicial:', error);
  }
}

/**
 * Lists all users (for admin purposes)
 * @returns {Promise<Neo4jUser[]>} List of users
 */
export async function listUsersInNeo4j(): Promise<Neo4jUser[]> {
  const query = `
    MATCH (u:User)
    RETURN u
    ORDER BY u.created_at DESC
  `;
  
  try {
    const result = await queryNeo4j(query);
    return result.map((record: any) => {
      const user = record.u.properties;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        password_hash: user.password_hash,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    });
  } catch (error) {
    console.error('Erro ao listar usuários no Neo4j:', error);
    throw error;
  }
}
