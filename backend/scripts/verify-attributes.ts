import { ProductAttributeService } from '../src/features/business/product-attribute/product-attribute.service'

async function main() {
  const svc = new ProductAttributeService()
  const res = await svc.getAttributes({ page: 1, pageSize: 10 })
  console.log(JSON.stringify({ count: res.data.data.length }, null, 2))
}

main()
