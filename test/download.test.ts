import { downloadHTML } from '../lambdas/download';

describe('download matches', () => {
  it('should download the html from the server', async () => {
    const html = await downloadHTML(
      'https://ns3104249.ip-54-37-85.eu/shared/portales_files/agenda_portales.php',
      'fmp',
      1,
      21,
    );
    expect(html).toBeDefined();
    expect(html?.length).toBeGreaterThan(100);
  });
});
