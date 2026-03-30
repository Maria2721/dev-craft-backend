export function mapUserFacingDifyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('Speech to text is not enabled')) {
    return (
      'Voice was not processed: speech recognition is disabled for this app in Dify. ' +
      'Open the app in Studio, open Features, enable Speech to text, then Publish again. ' +
      'Your workspace must have a Speech-to-text provider configured.'
    );
  }
  if (msg.includes('Invalid provider')) {
    return (
      'Voice was not processed: Dify has a broken or outdated model selected for Speech-to-text ' +
      '(error like Invalid provider). Go to Workspace settings, System model settings, ' +
      'the Speech to text section, and pick a working model again (e.g. Whisper via the current OpenAI plugin from the marketplace). ' +
      'If needed, reinstall/update the OpenAI plugin and set your API key again.'
    );
  }
  return 'The service is temporarily unavailable. Please try again later.';
}
