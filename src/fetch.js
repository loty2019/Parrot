const url = 'https://movie-database-alternative.p.rapidapi.com/?r=json&i=tt4154796';
const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': '8fd2ab6400msh9197cd35fadda35p185c83jsn7752d54799e8',
    'X-RapidAPI-Host': 'movie-database-alternative.p.rapidapi.com'
  }
};

try {
  const response = await fetch(url, options);
  const result = await response.text();
  console.log(result);
} catch (error) {
  console.error(error);
}
