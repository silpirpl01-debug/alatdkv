
"use client";

type Props = {
  disabled?: boolean;
};

export default function ConfirmDeleteButton({
  disabled = false,
}: Props) {
  return (
    <button
      type="submit"
      disabled={disabled}
      onClick={(event) => {
        const yakin = window.confirm(
          "Yakin ingin menghapus alat ini? Tindakan ini tidak bisa dibatalkan."
        );

        if (!yakin) {
          event.preventDefault();
        }
      }}
      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Hapus Alat
    </button>
  );
}
