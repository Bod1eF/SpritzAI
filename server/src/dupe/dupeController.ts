import { Body, Controller, Post, Response, Route, SuccessResponse } from 'tsoa';
import { findDupes } from './dupeService.ts';
import { ErrorResponse, FindDupesRequest, FindDupesResponse, HttpError } from './types';

@Route('dupe')
export class DupeController extends Controller {
  @Post('search')
  @SuccessResponse(200, 'OK')
  @Response<ErrorResponse>(400, 'Invalid or missing URL')
  @Response<ErrorResponse>(404, 'Failed to scrape the URL')
  @Response<ErrorResponse>(422, 'Page does not appear to describe a fragrance')
  @Response<ErrorResponse>(500, 'Internal server error')
  public async findDupes(
    @Body() body: FindDupesRequest
  ): Promise<FindDupesResponse | ErrorResponse> {
    try {
      const result = await findDupes(body?.url);
      this.setStatus(200);
      return result;
    } catch (err) {
      if (err instanceof HttpError) {
        this.setStatus(err.status);
        return { error: err.message };
      }
      console.error('Error in findDupes:', err);
      this.setStatus(500);
      return { error: 'Internal server error' };
    }
  }
}