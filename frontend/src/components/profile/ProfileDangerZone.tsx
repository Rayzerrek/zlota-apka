import { TrashIcon, WarningIcon } from "@phosphor-icons/react";

const ghostBtnCls =
  "inline-flex items-center gap-2 px-4 py-2.5 bg-transparent border border-rule rounded-[2px] text-ink-muted text-[13px] font-medium cursor-pointer transition-all duration-200 hover:border-rule-strong hover:text-ink";

const dangerBtnCls =
  "inline-flex items-center gap-2 px-4 py-2.5 bg-transparent border border-rating-1 rounded-[2px] text-rating-1 text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-rating-1/8";

const dangerSolidBtnCls =
  "inline-flex items-center gap-2 px-4 py-2.5 bg-rating-1 border border-rating-1 rounded-[2px] text-paper text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#c94a4a]";

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
        <p className="text-[14px] text-ink-muted leading-[1.55] max-w-[48ch] mb-5">
          <WarningIcon size={30} weight="fill" className="text-rating-1" />
          Usunięcie profilu jest nieodwracalne. Wszystkie karty, sesje i postępy
          zostaną trwale utracone.
        </p>
      </div>

      {!confirmDelete ? (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className={dangerBtnCls}
        >
          <TrashIcon size={14} />
          Usuń profil
        </button>
      ) : (
        <div className="flex flex-col gap-3 p-4 border border-rating-1 rounded-sm bg-rating-1/5">
          <div className="mono text-[11px] tracking-[0.14em] uppercase text-rating-1">
            Czy na pewno?
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={onDelete}
              className={dangerSolidBtnCls}
            >
              <TrashIcon size={14} />
              Tak, usuń trwale
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className={ghostBtnCls}
            >
              Anuluj
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
