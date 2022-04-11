import * as github from '@actions/github'
import * as backstage from '@botpress/backstage'
import chalk from 'chalk'

export const decode = (data: any): [backstage.SchemaType, backstage.BaseEntity[]] => {
  const config = backstage.schema.safeParse(data)

  if (!config.success) {
    throw Error(`Unable to parse entity ${config.error}`)
  }

  return [config.data, convert(config.data)]
}

const convert = (schema: backstage.SchemaType): backstage.BaseEntity[] => {
  const type = schema.type

  switch (type) {
    case 'service@v1':
      return convertServiceV1(schema)
    case 'website@v1':
      return convertWebsiteV1(schema)
    case 'documentation@v1':
      return convertDocumentationV1(schema)
    default:
      throw Error(`Invalid schema type ${chalk.blue(type)}`)
  }
}

const capitalizeWords = (value: string) => value.split(' ').map(v => v.charAt(0).toUpperCase() + v.substring(1).toLowerCase())

const getMetadata = (schema: backstage.SchemaType, titleSuffix: string) => {
  const titleName = capitalizeWords(schema.name.replace(/-/g, ' '))

  return {
    name: schema.name.toLowerCase(),
    description: schema.description,
    owner: `group:default/${schema.team}`,
    title: `${titleName} ${titleSuffix}`,
    github: {
      organization: github.context.repo.owner,
      repository: github.context.repo.repo,
    },
  }
}

const convertServiceV1 = (schema: backstage.ServiceV1SchemaType) => {
  const meta = getMetadata(schema, 'Service')

  const entity = backstage.Service({
    description: meta.description,
    github: meta.github,
    name: meta.name,
    owner: meta.owner,
    system: `system:default/${schema.system}`,
    title: meta.title,

    docs: {},
    dependsOn: [],
    providesApis: [],
  })

  return [entity]
}

const convertWebsiteV1 = (schema: backstage.WebsiteV1SchemaType) => {
  const meta = getMetadata(schema, 'Website')

  const entity = backstage.Website({
    description: meta.description,
    github: meta.github,
    name: meta.name,
    owner: meta.owner,
    system: `system:default/${schema.system}`,
    title: meta.title,

    docs: {},
  })

  return [entity]
}

const convertDocumentationV1 = (schema: backstage.DocumentationV1SchemaType) => {
  const meta = getMetadata(schema, 'Website')

  const entity = backstage.Documentation({
    description: meta.description,
    name: meta.name,
    owner: meta.owner,
    title: meta.title,
  })

  return [entity]
}
