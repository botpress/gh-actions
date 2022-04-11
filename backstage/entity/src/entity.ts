import * as github from '@actions/github'
import * as backstage from '@botpress/backstage'
import chalk from 'chalk'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'

export const decode = (data: any, source: string): [backstage.SchemaType, backstage.BaseEntity[]] => {
  const config = backstage.schema.safeParse(data)

  if (!config.success) {
    throw Error(`Unable to parse entity ${config.error}`)
  }

  const entities = convert(config.data, source)

  entities.forEach((entity) => addLinks(entity))

  return [config.data, entities]
}

const addLinks = (entity: backstage.BaseEntity) => {
  entity.addLink({
    title: 'Github',
    url: `https://github.com/${github.context.repo.owner}/${github.context.repo.repo}`,
    icon: 'logo.github'
  })
}

const convert = (schema: backstage.SchemaType, source: string): backstage.BaseEntity[] => {
  const type = schema.type

  switch (type) {
    case 'service@v1':
      return convertServiceV1(schema, source)
    case 'website@v1':
      return convertWebsiteV1(schema)
    case 'documentation@v1':
      return convertDocumentationV1(schema)
    default:
      throw Error(`Invalid schema type ${chalk.blue(type)}`)
  }
}

const capitalizeWords = (value: string) =>
  value
    .split(' ')
    .map((v) => v.charAt(0).toUpperCase() + v.substring(1).toLowerCase())
    .join(' ')

const getMetadata = (schema: backstage.SchemaType, titleSuffix: string) => {
  const titleName = capitalizeWords(schema.name.replace(/-/g, ' '))

  return {
    name: schema.name.toLowerCase(),
    description: schema.description,
    owner: `group:default/${schema.team}`,
    title: `${titleName} ${titleSuffix}`,
    docs: !!schema.docs,
    github: {
      organization: github.context.repo.owner,
      repository: github.context.repo.repo
    }
  }
}

const convertServiceV1 = (schema: backstage.ServiceV1SchemaType, source: string) => {
  const entities = []

  const system = `system:default/${schema.system}`
  const providesApis = []

  if (schema.api) {
    const apiMeta = getMetadata(schema, 'Api')

    const directory = dirname(source)
    const definition = readFileSync(join(directory, schema.api.source)).toString()

    const apiEntity = backstage.Api({
      ...apiMeta,
      system,
      definition,
      type: schema.api.type
    })

    entities.push(apiEntity)

    providesApis.push(apiEntity.ref())
  }

  const serviceMeta = getMetadata(schema, 'Service')
  const serviceEntity = backstage.Service({
    ...serviceMeta,
    system,
    dependsOn: [],
    providesApis
  })

  entities.push(serviceEntity)

  return entities
}

const convertWebsiteV1 = (schema: backstage.WebsiteV1SchemaType) => {
  const meta = getMetadata(schema, 'Website')

  const entity = backstage.Website({
    ...meta,
    system: `system:default/${schema.system}`
  })

  return [entity]
}

const convertDocumentationV1 = (schema: backstage.DocumentationV1SchemaType) => {
  const meta = getMetadata(schema, 'Documentation')

  const entity = backstage.Documentation(meta)

  return [entity]
}
