import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  BookOpen,
  Trash2,
  Plus,
  Calendar,
  Star,
  Search,
  BarChart3,
  Moon,
  Sun,
} from "lucide-react";

// APP COMPLETA DE LIBROS PARA MÓVIL
// Incluye MODO OSCURO 🌙

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

  // Cargar libros
  useEffect(() => {
    const saved = localStorage.getItem("mis_libros");
    if (saved) setBooks(JSON.parse(saved));

    const savedTheme = localStorage.getItem("modo_oscuro");
    if (savedTheme === "true") setDarkMode(true);
  }, []);

  // Guardar libros
  useEffect(() => {
    localStorage.setItem("mis_libros", JSON.stringify(books));
  }, [books]);

  // Guardar modo oscuro
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

    setTitle("");
    setAuthor("");
    setDateRead("");
    setRating(0);
    setNotes("");
    setShowForm(false);
  };

  const deleteBook = (id) => {
    setBooks(books.filter((book) => book.id !== id));
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  const filteredBooks = useMemo(() => {
    return books.filter((book) =>
      (book.title + " " + book.author + " " + book.notes)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [books, search]);

  const booksByYear = useMemo(() => {
    const groups = {};
    filteredBooks.forEach((book) => {
      const year = book.dateRead
        ? new Date(book.dateRead).getFullYear()
        : "Sin fecha";
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
          className={`w-6 h-6 cursor-pointer ${
            s <= value
              ? "fill-yellow-400 text-yellow-400"
              : darkMode
              ? "text-gray-500"
              : "text-gray-300"
          }`}
          onClick={() => onChange(s)}
        />
      ))}
    </div>
  );

  const bgMain = darkMode ? "bg-gray-900 text-white" : "bg-gray-50";
  const cardBg = darkMode ? "bg-gray-800 text-white" : "bg-white";
  const inputBg = darkMode
    ? "bg-gray-800 text-white border-gray-600"
    : "";

  return (
    <div className={`min-h-screen flex flex-col ${bgMain}`}>
      {/* Header */}
      <div
        className={`sticky top-0 shadow-sm p-3 flex items-center justify-between gap-2 ${cardBg}`}
      >
        <div className="flex items-center gap-2 font-bold">
          <BookOpen className="w-6 h-6" />
          Mis Libros
        </div>

        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={() => setShowStats(true)}
          >
            <BarChart3 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Buscador */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          <Input
            placeholder="Buscar libro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputBg}
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {Object.entries(booksByYear)
          .sort((a, b) => b[0] - a[0])
          .map(([year, yearBooks]) => (
            <div key={year}>
              <h2 className="font-bold text-lg mb-2">{year}</h2>

              <div className="space-y-3">
                {yearBooks.map((book) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={`rounded-2xl shadow-sm ${cardBg}`}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-base">
                              {book.title}
                            </p>

                            {book.author && (
                              <p className="text-sm opacity-70">
                                {book.author}
                              </p>
                            )}

                            {book.dateRead && (
                              <p className="text-sm opacity-70 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(book.dateRead)}
                              </p>
                            )}

                            {book.rating > 0 && (
                              <div className="flex gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-4 h-4 ${
                                      s <= book.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : darkMode
                                        ? "text-gray-500"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}

                            {book.notes && (
                              <p className="text-sm mt-1 opacity-80">
                                {book.notes}
                              </p>
                            )}
                          </div>

                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-10 w-10"
                            onClick={() => deleteBook(book.id)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-end">
          <div className={`w-full rounded-t-2xl p-4 space-y-3 ${cardBg}`}>
            <Input
              placeholder="Título del libro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`h-12 text-base ${inputBg}`}
            />

            <Input
              placeholder="Autor"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className={`h-12 text-base ${inputBg}`}
            />

            <Input
              type="date"
              value={dateRead}
              onChange={(e) => setDateRead(e.target.value)}
              className={`h-12 text-base ${inputBg}`}
            />

            <div>
              <p className="text-sm font-medium mb-1">Puntuación</p>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <Input
              placeholder="Notas o resumen"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`h-12 text-base ${inputBg}`}
            />

            <Button className="w-full h-12 text-base" onClick={addBook}>
              Guardar libro
            </Button>

            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      {showStats && (
        <div className="fixed inset-0 bg-black/40 flex items-end">
          <div
            className={`w-full rounded-t-2xl p-4 space-y-3 max-h-[70vh] overflow-y-auto ${cardBg}`}
          >
            <h2 className="font-bold text-lg">Estadísticas</h2>

            {Object.entries(stats)
              .sort((a, b) => b[0] - a[0])
              .map(([year, count]) => (
                <p key={year}>
                  {year}: {count} libros
                </p>
              ))}

            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => setShowStats(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <div className="fixed bottom-5 right-5">
        <Button
          className="rounded-full h-14 w-14 shadow-lg text-lg"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
