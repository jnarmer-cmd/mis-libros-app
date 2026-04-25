import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen, Trash2, Plus, Calendar, Star, Search, BarChart3, Moon, Sun
} from "lucide-react";

// --- COMPONENTES DE EMERGENCIA (Sustituyen a la carpeta @/components) ---
const Card = ({ children, className }) => (
  <div className={`rounded-xl border border-gray-200 shadow-sm ${className}`}>{children}</div>
);
const CardContent = ({ children, className }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
const Button = ({ children, className, variant, size, ...props }) => {
  const variants = {
    outline: "border border-gray-300 bg-transparent text-gray-700",
    destructive: "bg-red-500 text-white",
    default: "bg-blue-600 text-white"
  };
  return (
    <button 
      className={`px-4 py-2 rounded-lg font-medium active:opacity-70 transition-opacity ${variants[variant] || variants.default} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
const Input = ({ className, ...props }) => (
  <input 
    className={`flex h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} 
    {...props} 
  />
);

// Engañamos a la app para que no use Framer Motion (que a veces da error en Safari)
const motion = { div: ({ children, ...props }) => <div {...props}>{children}</div> };

// --- TU APP DE LIBROS ---
export default function AppSeguimientoLibrosMovil() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [dateRead, setDateRead] = useState("");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mis_libros");
    if (saved) setBooks(JSON.parse(saved));
    const savedTheme = localStorage.getItem("modo_oscuro");
    if (savedTheme === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("mis_libros", JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem("modo_oscuro", darkMode);
  }, [darkMode]);

  const addBook = () => {
    if (!title.trim()) return;
    const newBook = {
      id: Date.now(),
      title,
      author,
      dateRead,
      rating,
      notes,
      createdAt: Date.now(),
    };
    setBooks([newBook, ...books]);
    setTitle(""); setAuthor(""); setDateRead(""); setRating(0); setNotes("");
    setShowForm(false);
  };

  const deleteBook = (id) => {
    setBooks(books.filter((book) => book.id !== id));
  };

  const filteredBooks = useMemo(() => {
    return books.filter((book) =>
      (book.title + " " + (book.author || "") + " " + (book.notes || ""))
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [books, search]);

  const booksByYear = useMemo(() => {
    const groups = {};
    filteredBooks.forEach((book) => {
      const year = book.dateRead ? new Date(book.dateRead).getFullYear() : "Sin fecha";
      if (!groups[year]) groups[year] = [];
      groups[year].push(book);
    });
    return groups;
  }, [filteredBooks]);

  const stats = useMemo(() => {
    const result = {};
    books.forEach((book) => {
      if (book.dateRead) {
        const year = new Date(book.dateRead).getFullYear();
        result[year] = (result[year] || 0) + 1;
      }
    });
    return result;
  }, [books]);

  const StarRating = ({ value, onChange }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-8 h-8 cursor-pointer ${s <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          onClick={() => onChange(s)}
        />
      ))}
    </div>
  );

  const bgMain = darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900";
  const cardBg = darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white border-gray-200";

  return (
    <div className={`min-h-screen flex flex-col ${bgMain}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 shadow-sm p-4 flex items-center justify-between ${cardBg}`}>
        <div className="flex items-center gap-2 font-bold text-xl">
          <BookOpen className="w-6 h-6 text-blue-500" />
          Mis Libros
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="outline" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button size="icon" variant="outline" onClick={() => setShowStats(true)}>
            <BarChart3 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Buscador */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar libro o autor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de Libros */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(booksByYear)
          .sort((a, b) => b[0] - a[0])
          .map(([year, yearBooks]) => (
            <div key={year}>
              <h2 className="font-bold text-lg mb-3 border-b pb-1">{year}</h2>
              <div className="space-y-4">
                {yearBooks.map((book) => (
                  <Card key={book.id} className={cardBg}>
                    <CardContent>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="font-bold text-lg leading-tight">{book.title}</p>
                          <p className="text-sm opacity-70 mb-2">{book.author}</p>
                          <div className="flex items-center gap-3 text-xs opacity-60">
                            {book.dateRead && <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {book.dateRead}</span>}
                            <div className="flex text-yellow-500">
                              {[...Array(book.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                            </div>
                          </div>
                          {book.notes && <p className="text-sm mt-2 italic opacity-80">"{book.notes}"</p>}
                        </div>
                        <Button variant="destructive" className="p-2 h-10 w-10" onClick={() => deleteBook(book.id)}>
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
          {books.length === 0 && (
            <div className="text-center py-20 opacity-50">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Aún no has añadido libros.</p>
              <p className="text-sm">¡Toca el botón + para empezar!</p>
            </div>
          )}
      </div>

      {/* Botón flotante */}
      <div className="fixed bottom-8 right-6">
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-2xl active:scale-90 transition-transform"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Formulario (Modal) */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className={`w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 space-y-4 shadow-2xl ${cardBg}`}>
            <h3 className="text-xl font-bold">Añadir Libro</h3>
            <Input placeholder="Título del libro" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Autor" value={author} onChange={(e) => setAuthor(e.target.value)} />
            <Input type="date" value={dateRead} onChange={(e) => setDateRead(e.target.value)} />
            <div>
              <p className="text-sm font-medium mb-2">Puntuación</p>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <Input placeholder="Notas o resumen" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 h-12" onClick={addBook}>Guardar</Button>
              <Button variant="outline" className="flex-1 h-12" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas (Modal) */}
      {showStats && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className={`w-full max-w-xs rounded-2xl p-6 space-y-4 ${cardBg}`}>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" /> Estadísticas
            </h3>
            <div className="space-y-2">
              {Object.entries(stats).length > 0 ? (
                Object.entries(stats).sort((a,b) => b[0]-a[0]).map(([year, count]) => (
                  <div key={year} className="flex justify-between border-b pb-1">
                    <span>{year}</span>
                    <span className="font-bold">{count} libros</span>
                  </div>
                ))
              ) : <p className="text-sm opacity-60">No hay datos suficientes.</p>}
            </div>
            <Button className="w-full" onClick={() => setShowStats(false)}>Cerrar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
