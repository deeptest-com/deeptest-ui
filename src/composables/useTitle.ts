/**
 * 设置 html Title  composables
 * @author LiQingSong
 */
import { ComputedRef, onMounted, Ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import settings from '@/config/settings';
import { RoutesDataItem } from '@/utils/routes';

export default function useTitle(route: ComputedRef<RoutesDataItem> | Ref<RoutesDataItem>): void {
    const{ t } = useI18n();

    const setTitle = (title: string): void => {
        let tt = t(title) ? t(title) : title
        if (tt) {
            tt += ' - ' + settings.siteTitle
        } else {
            tt = settings.siteTitle
        }

        document.title = tt
    }

    watch<RoutesDataItem, false>(route,(route) => {
        route.title && setTitle(route.title);
    })

    onMounted(()=> {
        setTitle(route.value.title);
    })

}