// Processamento paralelo para reduzir latência

export interface ParallelTask<T> {
  id: string;
  execute: () => Promise<T>;
  priority: number; // 1 = alta, 2 = média, 3 = baixa
}

export class ParallelProcessor<T> {
  private tasks: Map<string, ParallelTask<T>> = new Map();
  private results: Map<string, T> = new Map();
  private errors: Map<string, Error> = new Map();

  async executeParallel(tasks: ParallelTask<T>[]): Promise<Map<string, T>> {
    // Ordenar por prioridade
    const sortedTasks = tasks.sort((a, b) => a.priority - b.priority);
    
    // Executar tarefas de alta prioridade primeiro
    const highPriorityTasks = sortedTasks.filter(t => t.priority === 1);
    const mediumPriorityTasks = sortedTasks.filter(t => t.priority === 2);
    const lowPriorityTasks = sortedTasks.filter(t => t.priority === 3);

    // Executar em paralelo por prioridade
    const results = new Map<string, T>();

    // Alta prioridade - executar imediatamente
    if (highPriorityTasks.length > 0) {
      const highResults = await Promise.allSettled(
        highPriorityTasks.map(task => task.execute())
      );
      
      highPriorityTasks.forEach((task, index) => {
        const result = highResults[index];
        if (result.status === 'fulfilled') {
          results.set(task.id, result.value);
        } else {
          this.errors.set(task.id, result.reason);
        }
      });
    }

    // Média e baixa prioridade - executar em paralelo se não há tarefas de alta prioridade
    const remainingTasks = [...mediumPriorityTasks, ...lowPriorityTasks];
    if (remainingTasks.length > 0) {
      const remainingResults = await Promise.allSettled(
        remainingTasks.map(task => task.execute())
      );
      
      remainingTasks.forEach((task, index) => {
        const result = remainingResults[index];
        if (result.status === 'fulfilled') {
          results.set(task.id, result.value);
        } else {
          this.errors.set(task.id, result.reason);
        }
      });
    }

    return results;
  }

  getError(taskId: string): Error | undefined {
    return this.errors.get(taskId);
  }

  hasError(taskId: string): boolean {
    return this.errors.has(taskId);
  }

  clear(): void {
    this.tasks.clear();
    this.results.clear();
    this.errors.clear();
  }
}

// Função utilitária para executar tarefas em paralelo com timeout
export async function executeWithTimeout<T>(
  task: () => Promise<T>,
  timeoutMs: number = 5000
): Promise<T> {
  return Promise.race([
    task(),
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Task timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

// Função para executar múltiplas tarefas com timeout individual
export async function executeMultipleWithTimeout<T>(
  tasks: Array<{ id: string; execute: () => Promise<T>; timeout?: number }>,
  defaultTimeout: number = 3000
): Promise<Map<string, T>> {
  const results = new Map<string, T>();
  
  const promises = tasks.map(async ({ id, execute, timeout = defaultTimeout }) => {
    try {
      const result = await executeWithTimeout(execute, timeout);
      results.set(id, result);
    } catch (error) {
      console.error(`Task ${id} failed:`, error);
      throw error;
    }
  });

  await Promise.allSettled(promises);
  return results;
}

// Função para processar em lotes
export async function processInBatches<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }
  
  return results;
}
