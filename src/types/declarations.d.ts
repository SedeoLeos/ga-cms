// Optional peer dependencies — resolved at runtime only when the user installs them.
// These stubs prevent "cannot find module" errors for dynamically-imported optional packages.

declare module '@supabase/supabase-js' {
  export function createClient(
    url: string,
    key: string,
  ): {
    storage: {
      from(bucket: string): {
        upload(
          path: string,
          file: unknown,
          opts?: { contentType?: string },
        ): Promise<{ error: Error | null }>
        getPublicUrl(path: string): { data: { publicUrl: string } }
        remove(paths: string[]): Promise<{ error: Error | null }>
        createSignedUrl(
          path: string,
          expiresIn: number,
        ): Promise<{ data: { signedUrl: string } | null; error: Error | null }>
      }
    }
  }
}
