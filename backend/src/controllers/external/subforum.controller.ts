import {FilterExcludingWhere, repository,} from '@loopback/repository';
import {get, getModelSchemaRef, param,} from '@loopback/rest';
import {Subforum} from '../../models';
import {SubforumRepository} from '../../repositories';
import {intercept} from "@loopback/core";
import {ServerAuthenticationInterceptor, SubforumLinkerInterceptor} from "../../interceptors";

@intercept(ServerAuthenticationInterceptor.BINDING_KEY)
export class SubforumController {
  constructor(
    @repository(SubforumRepository)
    public subforumRepository: SubforumRepository,
  ) {
  }

  @intercept(SubforumLinkerInterceptor.BINDING_KEY)
  @get('/subforums/{id}', {
    responses: {
      '200': {
        description: 'Subforum model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Subforum, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Subforum, {exclude: 'where'}) filter?: FilterExcludingWhere<Subforum>
  ): Promise<Subforum> {
    return this.subforumRepository.findById(id, filter);
  }
}
