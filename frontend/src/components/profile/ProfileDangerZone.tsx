import { Button } from "@cloudflare/kumo/components/button";
import { TrashIcon, WarningIcon } from "@phosphor-icons/react";

type Props = {
  confirmDelete: boolean;
  setConfirmDelete: (v: boolean) => void;
  onDelete: () => void;
};

export function ProfileDangerZone({
  confirmDelete,
  setConfirmDelete,
  onDelete,
}: Props) {
  return (
    <section className="enter enter-d4 mt-6 pt-8 border-t border-dashed border-rule">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-[17px] text-ink-muted leading-[1.55] max-w-[48ch] mb-5">
          <WarningIcon size={30} weight="fill" className="text-rating-1" />
          Usunięcie profilu jest nieodwracalne. Wszystkie karty, sesje i postępy
          zostaną trwale utracone.
        </p>
      </div>

      {!confirmDelete ? (
        <Button
          variant="secondary-destructive"
          icon={TrashIcon}
          onClick={() => setConfirmDelete(true)}
        >
          Usuń profil
        </Button>
      ) : (
        <div className="flex flex-col gap-3 p-4 border border-rating-1 rounded-sm bg-rating-1/5">
          <div className="mono text-[14px] uppercase text-rating-1">
            Czy na pewno?
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="destructive" icon={TrashIcon} onClick={onDelete}>
              Tak, usuń trwale
            </Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Anuluj
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
