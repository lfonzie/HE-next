export interface BookData {
  title: string;
  author: string;
  coverUrl?: string;
  publishDate?: string;
  description?: string;
  isbn?: string;
  pages?: number;
  subjects?: string[];
  language?: string;
}

export interface OpenLibrarySearchResult {
  books: BookData[];
  totalResults: number;
  hasMore: boolean;
}

export class OpenLibraryService {
  private static readonly BASE_URL = 'https://openlibrary.org';
  private static readonly COVER_BASE_URL = 'https://covers.openlibrary.org/b';

  static async searchBooks(query: string, limit: number = 10): Promise<OpenLibrarySearchResult> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=title,author_name,first_publish_year,cover_i,isbn,number_of_pages_median,subject,language,description`
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      const books: BookData[] = data.docs?.map((doc: any) => ({
        title: doc.title || 'Título não disponível',
        author: doc.author_name?.[0] || 'Autor não disponível',
        coverUrl: doc.cover_i ? `${this.COVER_BASE_URL}/id/${doc.cover_i}-L.jpg` : undefined,
        publishDate: doc.first_publish_year?.toString(),
        description: doc.description?.[0] || doc.description,
        isbn: doc.isbn?.[0],
        pages: doc.number_of_pages_median,
        subjects: doc.subject?.slice(0, 5),
        language: doc.language?.[0]
      })) || [];

      return {
        books,
        totalResults: data.numFound || 0,
        hasMore: books.length === limit
      };
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      throw new Error('Erro ao buscar livros na OpenLibrary');
    }
  }

  static async getBookByISBN(isbn: string): Promise<BookData | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/isbn/${isbn}.json`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      return {
        title: data.title || 'Título não disponível',
        author: data.authors?.[0]?.name || 'Autor não disponível',
        coverUrl: data.covers?.[0] ? `${this.COVER_BASE_URL}/id/${data.covers[0]}-L.jpg` : undefined,
        publishDate: data.publish_date,
        description: data.description?.value || data.description,
        isbn: isbn,
        pages: data.number_of_pages,
        subjects: data.subjects?.map((s: any) => s.name).slice(0, 5),
        language: data.languages?.[0]?.key
      };
    } catch (error) {
      console.error('Erro ao buscar livro por ISBN:', error);
      return null;
    }
  }

  static formatAuthor(author: string): string {
    if (!author) return 'Autor não disponível';
    
    // Remove informações extras como datas de nascimento/morte
    return author.replace(/\(\d{4}-\d{4}\)|\(\d{4}-\)|\(\d{4}\)/, '').trim();
  }

  static formatDescription(description: string): string {
    if (!description) return 'Descrição não disponível';
    
    // Remove tags HTML se existirem
    return description.replace(/<[^>]*>/g, '').trim();
  }

  static getCoverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'L'): string {
    return `${this.COVER_BASE_URL}/id/${coverId}-${size}.jpg`;
  }
}
