/**
 * Spongebobify
 *
 * @description Time to **sPonGeBobIfY** your texts!
 * @image https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c82dd5b3-b0d8-44e8-b11d-a50e55b7b9de/df88x1u-11447c51-1026-4d83-8476-f996afc6356f.png/v1/fill/w_839,h_952,strp/spongebob_png_vector_2_by_carlosoof10_df88x1u-pre.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTQ1MyIsInBhdGgiOiJcL2ZcL2M4MmRkNWIzLWIwZDgtNDRlOC1iMTFkLWE1MGU1NWI3YjlkZVwvZGY4OHgxdS0xMTQ0N2M1MS0xMDI2LTRkODMtODQ3Ni1mOTk2YWZjNjM1NmYucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.VXhK7EIi9VfhkZ5SARHCtgO1Puq0L_0tfLVD9JegfhI
 */

export const spongebobify = (text) => {
  const result = text
    .split("")
    .map((c) => (Math.random() > 0.5 ? c.toLowerCase() : c.toUpperCase()))
    .join("");
  navigator.clipboard.writeText(result).catch(console.debug);
  return result;
};
