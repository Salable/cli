import fs from 'node:fs/promises';

const filePaths = ['./dist/auth/success.html', './dist/auth/error.html'];
let tailwindStyles = '';

async function migrateStyles() {
  const data = await fs.readFile('./src/styles/compiled.css', 'utf8');

  tailwindStyles = data;

  await Promise.allSettled(
    filePaths.map(async (filePath) => {
      const fileContents = await fs.readFile(filePath, 'utf8');

      const newContents = fileContents.replace(
        /(?=<!-- TAILWIND PLACEHOLDER START -->)(.*)(<!-- TAILWIND PLACEHOLDER END -->)/gs,
        `<style>
          ${tailwindStyles}
        </style>
    `
      );

      await fs.writeFile(filePath, newContents, 'utf8', function (err) {
        if (err) return console.log(err);
      });
    })
  );
}

migrateStyles();
