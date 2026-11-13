import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding database...');

  // ------------------------------------------------------------------
  // Genres (4+)
  // ------------------------------------------------------------------
  const [fiction, nonFiction, sciFi, mystery, fantasy] =
    await Promise.all([
      prisma.genre.upsert({
        where: { name: 'Fiction' },
        update: {},
        create: { name: 'Fiction' },
      }),
      prisma.genre.upsert({
        where: { name: 'Non-Fiction' },
        update: {},
        create: { name: 'Non-Fiction' },
      }),
      prisma.genre.upsert({
        where: { name: 'Science Fiction' },
        update: {},
        create: { name: 'Science Fiction' },
      }),
      prisma.genre.upsert({
        where: { name: 'Mystery' },
        update: {},
        create: { name: 'Mystery' },
      }),
      prisma.genre.upsert({
        where: { name: 'Fantasy' },
        update: {},
        create: { name: 'Fantasy' },
      }),
    ]);

  console.log('✅  Genres created');

  // ------------------------------------------------------------------
  // Users (sample librarian + patrons)
  // ------------------------------------------------------------------
  await prisma.user.upsert({
    where: { email: 'librarian@library.com' },
    update: {},
    create: { name: 'Alice Librarian', email: 'librarian@library.com', role: Role.LIBRARIAN },
  });

  const patron = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: { name: 'John Doe', email: 'john.doe@example.com', role: Role.PATRON },
  });

  console.log('✅  Users created');

  // ------------------------------------------------------------------
  // Books (15+ across all genres)
  // ------------------------------------------------------------------
  const booksData = [
    // Fiction (4)
    { title: 'To Kill a Mockingbird', author: 'Harper Lee',          isbn: '9780061935466', publishedYear: 1960, genreId: fiction.id,    description: 'A classic of Southern Gothic literature.' },
    { title: 'The Great Gatsby',      author: 'F. Scott Fitzgerald', isbn: '9780743273565', publishedYear: 1925, genreId: fiction.id,    description: 'A portrait of the Jazz Age in all of its decadence.' },
    { title: '1984',                  author: 'George Orwell',       isbn: '9780451524935', publishedYear: 1949, genreId: fiction.id,    description: 'Dystopian social science fiction novel.' },
    { title: 'Pride and Prejudice',   author: 'Jane Austen',         isbn: '9780141439518', publishedYear: 1813, genreId: fiction.id,    description: 'A romantic novel of manners.' },
    // Non-Fiction (3)
    { title: 'Sapiens',               author: 'Yuval Noah Harari',   isbn: '9780062316097', publishedYear: 2011, genreId: nonFiction.id, description: 'A brief history of humankind.' },
    { title: 'Educated',              author: 'Tara Westover',       isbn: '9780399590504', publishedYear: 2018, genreId: nonFiction.id, description: 'A memoir of a survivalist family.' },
    { title: 'Atomic Habits',         author: 'James Clear',         isbn: '9780735211292', publishedYear: 2018, genreId: nonFiction.id, description: 'An easy and proven way to build good habits.' },
    // Science Fiction (4)
    { title: 'Dune',                  author: 'Frank Herbert',       isbn: '9780441013593', publishedYear: 1965, genreId: sciFi.id,      description: 'Science fiction epic set in a desert world.' },
    { title: 'The Martian',           author: 'Andy Weir',           isbn: '9780804139021', publishedYear: 2011, genreId: sciFi.id,      description: 'An astronaut stranded on Mars.' },
    { title: 'Ender\'s Game',         author: 'Orson Scott Card',    isbn: '9780812550702', publishedYear: 1985, genreId: sciFi.id,      description: 'A child prodigy trains to fight alien invaders.' },
    { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', isbn: '9780441478125', publishedYear: 1969, genreId: sciFi.id,   description: 'Exploration of gender and society on an alien world.' },
    // Mystery (2)
    { title: 'Gone Girl',             author: 'Gillian Flynn',       isbn: '9780307588371', publishedYear: 2012, genreId: mystery.id,   description: 'A thriller about a missing woman.' },
    { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', isbn: '9780307949486', publishedYear: 2005, genreId: mystery.id, description: 'A journalist investigates a decades-old disappearance.' },
    // Fantasy (3)
    { title: 'The Name of the Wind',  author: 'Patrick Rothfuss',   isbn: '9780756404741', publishedYear: 2007, genreId: fantasy.id,   description: 'A legendary wizard recounts his life story.' },
    { title: 'The Way of Kings',      author: 'Brandon Sanderson',  isbn: '9780765326355', publishedYear: 2010, genreId: fantasy.id,   description: 'Epic fantasy in a world of storms and war.' },
    { title: 'A Wizard of Earthsea',  author: 'Ursula K. Le Guin',  isbn: '9780547773742', publishedYear: 1968, genreId: fantasy.id,   description: 'A young wizard discovers his true power.' },
  ];

  for (const book of booksData) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {},
      create: { ...book, availableCopies: 3 },
    });
  }

  console.log(`✅  ${booksData.length} books created`);

  // ------------------------------------------------------------------
  // Sample reviews (stretch)
  // ------------------------------------------------------------------
  const dune = await prisma.book.findUnique({ where: { isbn: '9780441013593' } });
  if (dune) {
    await prisma.review.upsert({
      where: { bookId_userId: { bookId: dune.id, userId: patron.id } },
      update: {},
      create: { bookId: dune.id, userId: patron.id, rating: 5, comment: 'An absolute masterpiece of world-building.' },
    });
  }

  console.log('✅  Sample reviews created');
  console.log('🎉  Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
