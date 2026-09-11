/**
 * Formulário de criação/edição de produto (RF07): dados gerais, categoria,
 * variações (tamanho/cor/estoque/sku) e upload de fotos.
 *
 * Fotos: cada arquivo enviado via POST /admin/uploads/image volta como uma
 * URL já hospedada; essas URLs ficam em `uploadedPhotos` até o submit, que
 * as envia como `images` dentro do payload de criação/atualização — o
 * backend persiste o vínculo em ProductImage (a primeira foto vira capa).
 */
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Spinner } from "../../components/common/Spinner";
import Button from "../../components/ui/button/Button";
import Alert from "../../components/ui/alert/Alert";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import FileInput from "../../components/form/input/FileInput";
import Select from "../../components/form/Select";
import Switch from "../../components/form/switch/Switch";
import Checkbox from "../../components/form/input/Checkbox";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { uploadService } from "../../services/uploadService";
import { getErrorMessage, resolveFileUrl } from "../../services/api";
import {
  ProductStyleTag,
  PRODUCT_STYLE_TAG_LABELS,
  type Product,
} from "../../types/product.types";

// Ordem fixa de exibição dos 5 atributos de estilo do mockup (filtros da
// home do site) — mesmos rótulos usados em PRODUCT_STYLE_TAG_LABELS.
const STYLE_TAG_OPTIONS = Object.values(ProductStyleTag);

// Nota: os campos numéricos (basePrice, stockQuantity) são registrados no
// react-hook-form com `valueAsNumber: true`, então o schema já os declara
// como z.number() — sem z.coerce, para manter o tipo de entrada e de
// saída do formulário idênticos (evita conflito de tipos entre
// react-hook-form e o resolver do zod). `priceOverride` fica como texto
// simples (opcional) e é convertido para número só no envio.
const variantSchema = z.object({
  size: z.string().trim().min(1, "Informe o tamanho"),
  color: z.string().trim().min(1, "Informe a cor"),
  sku: z.string().trim().max(60, "SKU muito longo").optional(),
  stockQuantity: z
    .number({ message: "Informe a quantidade em estoque" })
    .int("O estoque deve ser um número inteiro")
    .min(0, "O estoque não pode ser negativo"),
  priceOverride: z.string().optional(),
  active: z.boolean().optional(),
});

const productSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do produto").max(200, "Nome muito longo"),
  description: z.string().trim().optional(),
  basePrice: z.number({ message: "Informe o preço" }).min(0, "O preço não pode ser negativo"),
  categoryId: z.string().optional(),
  active: z.boolean(),
  styleTags: z.array(z.nativeEnum(ProductStyleTag)),
  variants: z.array(variantSchema).min(1, "Cadastre ao menos uma variação (tamanho/cor)"),
});

type ProductFormValues = z.infer<typeof productSchema>;

function toFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    description: product.description ?? "",
    basePrice: product.basePrice,
    categoryId: product.categoryId ?? "",
    active: product.active,
    styleTags: product.styleTags ?? [],
    variants: product.variants.map((variant) => ({
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
      stockQuantity: variant.stockQuantity,
      priceOverride: variant.priceOverride !== null ? String(variant.priceOverride) : "",
      active: variant.active,
    })),
  };
}

const emptyVariant = { size: "", color: "", sku: "", stockQuantity: 0, active: true };

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [serverError, setServerError] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const productFromState = (location.state as { product?: Product } | null)?.product;

  // Se a tela de edição foi aberta por link direto (refresh, aba nova),
  // sem vir da lista via <Link state={{ product }}>, busca o produto
  // diretamente por id em GET /admin/products/:id.
  const { data: fetchedProduct, isLoading: isLoadingFallback } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => productService.getById(id as string),
    enabled: isEditing && !productFromState && !!id,
  });

  const product = productFromState ?? fetchedProduct ?? null;

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.list(),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      categoryId: "",
      active: true,
      styleTags: [],
      variants: [emptyVariant],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  useEffect(() => {
    if (product) {
      reset(toFormValues(product));
      setUploadedPhotos(
        [...product.images]
          .sort((a, b) => a.position - b.position)
          .map((image) => image.url)
      );
    }
  }, [product, reset]);

  const categoryOptions = useMemo(
    () => (categories ?? []).map((category) => ({ value: category.id, label: category.name })),
    [categories]
  );

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        basePrice: values.basePrice,
        categoryId: values.categoryId || undefined,
        active: values.active,
        styleTags: values.styleTags,
        variants: values.variants.map((variant) => ({
          size: variant.size,
          color: variant.color,
          sku: variant.sku || undefined,
          stockQuantity: variant.stockQuantity,
          priceOverride:
            !variant.priceOverride || variant.priceOverride.trim() === ""
              ? null
              : Number(variant.priceOverride),
          active: variant.active ?? true,
        })),
        images: uploadedPhotos.map((url, index) => ({
          url,
          isCover: index === 0,
          position: index,
        })),
      };
      if (isEditing && id) {
        return productService.update(id, payload);
      }
      return productService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      navigate("/produtos");
    },
    onError: (err) => setServerError(getErrorMessage(err)),
  });

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    setServerError("");
    try {
      const { url } = await uploadService.uploadImage(file);
      setUploadedPhotos((prev) => [...prev, url]);
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = "";
    }
  };

  if (isEditing && !product && isLoadingFallback) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isEditing && !product) {
    return (
      <Alert
        variant="error"
        title="Produto não encontrado"
        message="Não foi possível localizar este produto. Volte para a lista e tente novamente."
      />
    );
  }

  return (
    <>
      <PageMeta
        title={`${isEditing ? "Editar" : "Novo"} produto | Glitch Admin`}
        description="Cadastro de produto da loja Glitch"
      />
      <PageBreadcrumb pageTitle={isEditing ? "Editar produto" : "Novo produto"} />

      {serverError && (
        <div className="mb-5">
          <Alert variant="error" title="Não foi possível salvar" message={serverError} />
        </div>
      )}

      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-6"
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-5 text-base font-medium text-gray-800 dark:text-white/90">
            Dados do produto
          </h3>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nome do produto</Label>
              <Input id="name" {...register("name")} error={!!errors.name} hint={errors.name?.message} />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextArea
                    placeholder="Descreva o produto (opcional)"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    rows={4}
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="basePrice">Preço (R$)</Label>
              <Input
                id="basePrice"
                type="number"
                step={0.01}
                min="0"
                {...register("basePrice", { valueAsNumber: true })}
                error={!!errors.basePrice}
                hint={errors.basePrice?.message}
              />
            </div>

            <div>
              <Label htmlFor="categoryId">Categoria</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    placeholder="Selecione uma categoria"
                    value={field.value}
                    options={categoryOptions}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="md:col-span-2">
              <Controller
                control={control}
                name="active"
                render={({ field }) => (
                  <Switch
                    label="Publicado (visível no site)"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Atributos de estilo (filtros da home do site)</Label>
              <Controller
                control={control}
                name="styleTags"
                render={({ field }) => (
                  <div className="mt-1 flex flex-wrap gap-x-6 gap-y-3">
                    {STYLE_TAG_OPTIONS.map((tag) => (
                      <Checkbox
                        key={tag}
                        id={`styleTags-${tag}`}
                        label={PRODUCT_STYLE_TAG_LABELS[tag]}
                        checked={field.value.includes(tag)}
                        onChange={(checked) =>
                          field.onChange(
                            checked
                              ? [...field.value, tag]
                              : field.value.filter((value) => value !== tag)
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-2 text-base font-medium text-gray-800 dark:text-white/90">
            Fotos do produto
          </h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            A primeira foto da lista é usada como capa do produto no catálogo.
          </p>
          <FileInput
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoUpload}
            className="mb-3"
          />
          {isUploadingPhoto && <Spinner size="sm" />}
          {uploadedPhotos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {uploadedPhotos.map((url, index) => (
                <div key={url} className="group relative">
                  <img
                    src={resolveFileUrl(url)}
                    alt="Foto enviada"
                    className="h-20 w-20 rounded-lg object-cover"
                    loading="lazy"
                  />
                  {index === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      Capa
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setUploadedPhotos((prev) => prev.filter((photoUrl) => photoUrl !== url))
                    }
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-error-500 shadow-theme-xs hover:bg-error-50 dark:border-gray-700 dark:bg-gray-900"
                    aria-label="Remover foto"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Variações (tamanho e cor)
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(emptyVariant)}
            >
              + Adicionar variação
            </Button>
          </div>

          {errors.variants?.root && (
            <p className="mb-3 text-sm text-error-500">{errors.variants.root.message}</p>
          )}
          {typeof errors.variants?.message === "string" && (
            <p className="mb-3 text-sm text-error-500">{errors.variants.message}</p>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 gap-3 rounded-xl border border-gray-100 p-4 dark:border-gray-800 sm:grid-cols-2 lg:grid-cols-5"
              >
                <div>
                  <Label htmlFor={`variants.${index}.size`}>Tamanho</Label>
                  <Input
                    id={`variants.${index}.size`}
                    placeholder="P, M, G..."
                    {...register(`variants.${index}.size` as const)}
                    error={!!errors.variants?.[index]?.size}
                    hint={errors.variants?.[index]?.size?.message}
                  />
                </div>
                <div>
                  <Label htmlFor={`variants.${index}.color`}>Cor</Label>
                  <Input
                    id={`variants.${index}.color`}
                    placeholder="Preto, Branco..."
                    {...register(`variants.${index}.color` as const)}
                    error={!!errors.variants?.[index]?.color}
                    hint={errors.variants?.[index]?.color?.message}
                  />
                </div>
                <div>
                  <Label htmlFor={`variants.${index}.sku`}>SKU (opcional)</Label>
                  <Input
                    id={`variants.${index}.sku`}
                    placeholder="Gerado automaticamente"
                    {...register(`variants.${index}.sku` as const)}
                  />
                </div>
                <div>
                  <Label htmlFor={`variants.${index}.stockQuantity`}>Estoque</Label>
                  <Input
                    id={`variants.${index}.stockQuantity`}
                    type="number"
                    min="0"
                    {...register(`variants.${index}.stockQuantity` as const, { valueAsNumber: true })}
                    error={!!errors.variants?.[index]?.stockQuantity}
                    hint={errors.variants?.[index]?.stockQuantity?.message}
                  />
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`variants.${index}.priceOverride`}>Preço especial</Label>
                    <Input
                      id={`variants.${index}.priceOverride`}
                      type="number"
                      step={0.01}
                      min="0"
                      placeholder="Usa o preço do produto"
                      {...register(`variants.${index}.priceOverride` as const)}
                    />
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="mb-0.5 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-error-500 hover:bg-error-50 dark:border-gray-700 dark:hover:bg-error-500/10"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/produtos")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || mutation.isPending}>
            {mutation.isPending ? "Salvando..." : "Salvar produto"}
          </Button>
        </div>
      </form>
    </>
  );
}
