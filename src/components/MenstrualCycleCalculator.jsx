import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Droplet } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const MenstrualCycleCalculator = () => {
    const [startDate, setStartDate] = useState(null);
    const [cycleResult, setCycleResult] = useState(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const { toast } = useToast();

    const handleDateSelect = (date) => {
        setStartDate(date);
        setIsCalendarOpen(false);
    };

    const calculateCycle = () => {
        if (!startDate) {
            toast({
                title: "Fecha requerida",
                description: "Por favor selecciona la fecha de inicio de tu último periodo.",
                variant: "destructive",
            });
            return;
        }

        const cycleLength = 28;
        const ovulationDay = 14;
        
        const ovulationDate = addDays(startDate, ovulationDay);
        const fertileStart = addDays(ovulationDate, -4);
        const fertileEnd = addDays(ovulationDate, 1);
        const nextPeriod = addDays(startDate, cycleLength);

        const options = { locale: es };

        setCycleResult({
            ovulation: format(ovulationDate, "PPP", options),
            fertileWindow: `del ${format(fertileStart, "PPP", options)} al ${format(fertileEnd, "PPP", options)}`,
            nextPeriod: format(nextPeriod, "PPP", options),
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-3xl p-4 sm:p-6 card-hover text-center relative"
        >
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4">
                <div className="p-3 sm:p-4 bg-brand-accent/20 rounded-full mb-3 sm:mb-0 sm:mr-4">
                    <Droplet className="w-6 h-6 sm:w-8 sm:h-8 text-brand-primary" />
                </div>
                <div className="text-center sm:text-left">
                     <h3 className="text-xl sm:text-2xl font-bold font-serif text-brand-primary">Calendario Menstrual</h3>
                     <p className="text-sm sm:text-base text-brand-secondary">Calcula tu ciclo y conoce tus días fértiles.</p>
                </div>
            </div>

            <p className="text-sm sm:text-base text-brand-secondary my-4 px-2">Ingresa la fecha del primer día de tu último periodo:</p>

            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full max-w-[280px] mx-auto justify-start text-left font-normal text-sm sm:text-base",
                            !startDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                    </Button>
                </PopoverTrigger>
               <PopoverContent className="w-[90vw] max-w-sm mt-6 z-30 bg-white rounded-xl shadow-xl p-2 sm:p-4">
                    <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleDateSelect}
                        initialFocus
                        locale={es}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        className="w-full"
                    />
                </PopoverContent>
            </Popover>

            <Button onClick={calculateCycle} className="mt-4 bg-[#8C7C9E] hover:bg-[#5A3F6B] text-white w-full max-w-xs mx-auto text-sm sm:text-base">
                Calcular mi ciclo
            </Button>

            {cycleResult && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 text-left bg-brand-background/50 p-3 sm:p-4 rounded-xl"
                >
                    <h4 className="font-bold text-base sm:text-lg text-brand-primary text-center mb-3">Tu ciclo estimado</h4>
                    <div className="space-y-2 text-sm sm:text-base">
                        <p className="text-brand-secondary"><strong className="text-brand-primary">Ovulación:</strong> {cycleResult.ovulation}</p>
                        <p className="text-brand-secondary"><strong className="text-brand-primary">Días fértiles:</strong> {cycleResult.fertileWindow}</p>
                        <p className="text-brand-secondary"><strong className="text-brand-primary">Próximo periodo:</strong> {cycleResult.nextPeriod}</p>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default MenstrualCycleCalculator;
