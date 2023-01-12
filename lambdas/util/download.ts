import axios from 'axios';

async function downloadHTML(
  url: string,
  client: string,
  idm: number,
  tempId: number,
): Promise<string | null> {
  try {
    const response = await axios.post(
      url,
      `cliente=${client}&idm=${idm}&id_temp=${tempId}`,
      {
        headers: {
          Referer: 'http://competiciones.fmp.es/',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          accept: 'text/html, */*; q=0.01',
          'accept-language': 'es,en-US;q=0.9,en;q=0.8,it;q=0.7',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'sec-ch-ua':
            '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Error retrieving matches:', (error as Error).message);
    console.error(error);

    return null;
  }
}

export { downloadHTML };
